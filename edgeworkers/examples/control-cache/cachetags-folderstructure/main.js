export function onOriginResponse (request, response) {
  response.setHeader('Edge-Cache-Tag', getCacheTagsForPath(request.path))
}

function getCacheTagsForPath (path) {
  const cacheTagPrefix = 'path--'
  const cacheTagFolderSeparator = '|'
  const folderNames = path.split('/')
  const cacheTags = []
  for (let i = 1; i < folderNames.length; i++) {
    cacheTags.push(cacheTagPrefix + cacheTagFolderSeparator + folderNames.slice(1, i + 1).join(cacheTagFolderSeparator))
  }
  return '' + cacheTags.join(',')
}
