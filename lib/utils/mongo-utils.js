
const _ = require('lodash');

class MongoUtils {
  /**
   * create match condition for aggregate pipline directly for getRequest payload.
   * supports searching in given feilds.
   * mapping is used if payload key is different for from key in mongoose database shema.
   * @param {*} payload request payload which contains filter contions
   * @param {Array} exactFeilds exact feilds to match with exact value from payload.
   * @param {Array} searchFeilds feilds in database to search a string.Note payload should have key "searchString" to search.
   * @param {JSON} mapping maps key from payload to database schema key. 
   *      For nested documents use ' . ' like this {agentId : "agent.id" } 
   *      will match agentId from payload in agent.id feild in database.
   * @returns {Array} aggregate pipleline to match the documents with filter.
   */
  aggregateMatch(payload = {}, exactFeilds = [], searchFeilds = [], mapping = {}, defaultMatch = {}) {
    payload = { ...payload, ...defaultMatch };
    exactFeilds.push(...Object.keys(defaultMatch));
    let andArray = [];
    // payload to database key mapping
    for (let key in mapping) {
      if (payload.hasOwnProperty(key)) {
        payload[mapping[key]] = payload[key];
        delete payload[key];
      }
    }
    exactFeilds.forEach(feild => {
      if (!!feild && !!payload[feild] && typeof feild == 'string') {
        andArray.push({ [feild]: payload[feild] });
      }
    });


    // set searching condition
    if (!!payload.searchString && typeof payload.searchString == 'string' && searchFeilds.length) {
      let orArray = []
      searchFeilds.forEach(feild => {
        if (typeof feild == 'string') {
          orArray.push({ [feild]: new RegExp(payload.searchString, 'i') })
        }
      })
      if (!!orArray.length) {
        andArray.push({ $or: orArray });
      }
    }
    if (!!andArray.length) {
      //return match aggregate pipeline.
      return [{ $match: { $and: andArray } }];
    }
    return [];
  }

  /**
   * check feilds in payload and returns updateObject with keys and values to be updated.
   * @param {JSON} payload request payload which data to update.
   * @param {Array} feilds feilds to update in database.
   * @param {JSON} mapping maps key from payload to database schema key. 
   *      For nested documents use ' . ' like this {agentId : "agent.id" } 
   *      will update value agentId from payload in agent.id feild in database.
   */
  getDataToUpdate(payload = {}, feilds = [], mapping = {}) {
    let updateData = {}
    if (!!feilds.length) {
      feilds.forEach(feild => {
        if (!!feild && (!!payload[feild] || payload[feild] === false || payload[feild] === 0)) {
          updateData[feild] = payload[feild];
        }
      });
    }
    // map payload to database keys
    for (let key in mapping) {
      if (updateData.hasOwnProperty(key)) {
        updateData[mapping[key]] = updateData[key];
        delete updateData[key];
      }
    }
    return { $set: updateData };
  }

  /**
   * create pagination condition for aggregateQuery with sort.
   *
   * @param {JSON} sort valid mongodb sort condition Object.
   * @param {Number} skip no. of documents to skip.
   * @param {Number} limit no. of documents to return.
   * @returns {Promise<[JSON]>} aggregate pipeline queries for pagination.
   */
  paginator(sort, skip, limit) {
    let condition = [
      ...(!!sort ? [{ $sort: sort }] : []),
      { $skip: skip },
      { $limit: limit }
    ]
    return condition;
  }

  paginateWithTotalCount(sort, skip, limit) {
    let condition = [
      ...(!!sort ? [{ $sort: sort }] : []),
      { $group: { _id: null, items: { $push: '$$ROOT' }, totalCount: { $sum: 1 } } },
      { $addFields: { items: { $slice: ['$items', skip, limit] } } },
    ]
    return condition;
  }

  async checkDuplicateEntries(model, uniqueValues, payload = {}, uniqueKeys = []) {
    if (!uniqueValues) {
      uniqueValues = uniqueKeys.reduce((acc, key) => { acc[key] = payload[key]; return acc; }, {});
    }
    let orConditionArray = [];
    for (let key in uniqueValues) {
      if (!!uniqueValues[key]) {
        orConditionArray.push({ [key]: uniqueValues[key] })
      }
    }
    if (!orConditionArray.length) {
      return
    }
    let dataToFind = { $or: orConditionArray };
    let duplicateData = await model.findOne(dataToFind).lean();
    if (!!duplicateData) {
      for (let key in uniqueValues) {
        let duplicateKeyCondition = (
          (
            !!duplicateData[key]
            && !!uniqueValues[key]
          )
          && (
            duplicateData[key] == uniqueValues[key]
            || duplicateData[key].toString() == uniqueValues[key].toString()
          )
        )
        if (!!duplicateKeyCondition) {
          let err = {
            statusCode: 400,
            message: '{{key}} Already Exists',
            type: 'DUPLICATE_ENTRY'
          };
          err.message = err.message.replace('{{key}}', key);
          throw err;
        }
      }
    }
  }

  /**
   * array of lookup objects 
   * @param {Array<JSON>} [lookups=[]] keys contain normal lookup keys some additional keys ()
   * @param {Array<String>} [include=[]] keys to include from the lookup
   * @returns
   */
  lookup(lookups = [], include = []) {
    if (include instanceof Array && include.length) {
      lookups = lookups.filter(lookup => include.includes(lookup.name));
    }
    let lookupPipeLine = lookups.map(lookup => {
      let resultKey = lookup.as || lookup.localField + 'Data'
      let lookupStage = [{
        $lookup:
        {
          from: lookup.from || lookup.collection,
          ...(
            lookup.pipeline
              ? {
                let: lookup.let,
                pipeline: lookup.pipeline
              }
              : {
                localField: lookup.localField,
                foreignField: lookup.foreignField
              }
          ),
          as: resultKey,
        }
      }]
      if (lookup.multi === false) {
        lookupStage.push({
          $unwind:
          {
            path: '$' + resultKey,
            preserveNullAndEmptyArrays: lookup.allowNull === false ? false : true
          }
        })
      }
      return lookupStage;
    })

    return [].concat(...lookupPipeLine);
  }

  getSortCondition(payload, defaultKey, defaultDirection) {
    let sortCondition = {
      [payload.sortKey || defaultKey || '_id']: payload.sortDirection || defaultDirection || 1
    }
    return sortCondition;
  }
  getGeoNearStage(coordinates, maxDistance, matchQuery = {}, locationKey, minDistance = 0) {

    let options = _({
      near: { type: 'Point', coordinates: coordinates },
      distanceField: 'distance',
      minDistance,
      maxDistance,
      key: locationKey,
      includeLocs: "matchedLocation",
      spherical: false,
      query: matchQuery
    }).pickBy(val => !['', null, undefined, NaN].includes(val)).value();

    let geoNearStage = [{ $geoNear: options }];

    return geoNearStage;
  }

}


module.exports = new MongoUtils();