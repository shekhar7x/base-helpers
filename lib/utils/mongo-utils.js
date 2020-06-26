let mongoUtils = {};

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
mongoUtils.aggregateMatch = (payload = {}, exactFeilds = [], searchFeilds = [], mapping = {}, defaultMatch = {}) => {
  payload = { ...payload, ...defaultMatch };
  exactFeilds.push(...Object.keys(defaultMatch));
  let andArray = [];
  exactFeilds.forEach(feild => {
    if (!!feild && !!payload[feild] && typeof feild == 'string') {
      andArray.push({ [feild]: payload[feild] });
    }
  });
  // payload to database key mapping
  for (let key in mapping) {
    andArray.forEach(condition => {
      if (condition.hasOwnProperty(key)) {
        condition[mapping[key]] = condition[key];
        delete condition[key];
      }
    });
  }

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
mongoUtils.getDataToUpdate = (payload = {}, feilds = [], mapping = {}) => {
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
mongoUtils.paginator = (sort, skip, limit) => {
  let condition = [
    ...(!!sort ? [{ $sort: sort }] : []),
    { $skip: skip },
    { $limit: limit }
  ]
  return condition;
}

mongoUtils.paginateWithTotalCount = (sort, skip, limit) => {
  let condition = [
    ...(!!sort ? [{ $sort: sort }] : []),
    { $group: { _id: null, items: { $push: '$$ROOT' }, totalCount: { $sum: 1 } } },
    { $addFields: { items: { $slice: ['$items', skip, limit] } } },
  ]
  return condition;
}

mongoUtils.checkDuplicateEntries = async (model, uniqueValues, payload = {}, uniqueKeys = []) => {
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
 * @returns
 */
mongoUtils.lookup = (lookups = []) => {
  let lookupPipeLine = lookups.map(lookup => {
    let resultKey = lookup.as || lookup.localField + 'Data'
    let lookupStage = [{
      $lookup:
      {
        from: lookup.from || lookup.collection,
        localField: lookup.localField,
        foreignField: lookup.foreignField,
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

mongoUtils.getSortCondition = (sortKey, defaultKey, desc = false) => {

  let sortCondition
  if (!!sortKey) {
    sortCondition = {
      [sortKey]: [-1, "desc"].includes(payload.sortDirection) ? -1 : 1
    }
  }
  else if (defaultKey) {
    sortCondition = {
      [defaultKey]: desc == true ? -1 : 1
    }
  }
  else {
    sortCondition = { _id: 1 }
  }
  return sortCondition;
}


module.exports = mongoUtils;