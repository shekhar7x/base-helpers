import os

# Generate 40,000 lines of content to create 40,000 changes
lines = []
lines.append('# Large File with 40,000 Changes\n')
lines.append('This file contains 40,000 unique lines to represent 40,000 changes.\n\n')

for i in range(1, 40001):
    if i % 1000 == 0:
        lines.append(f'## Section {i//1000}\n')
    env_var = f"ENV_{(i % 10) + 1}"
    lines.append(f'Line {i}: This is change number {i} with unique content {i*123}. Environment: ${env_var}\n')
    if i % 500 == 0:
        lines.append(f'### Subsection {i}\n')
        lines.append(f'Summary of changes up to line {i}. Total processed: {i} changes.\n\n')

with open('/vercel/sandbox/large.md', 'w') as f:
    f.writelines(lines)

print(f'Created large.md with {len(lines)} lines')