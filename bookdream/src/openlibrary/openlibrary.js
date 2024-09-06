import {
  usersCollection,
  account,
  databaseKey,
  databases
} from '../appwrite/appwriteConfig'

export function httpGetAsync (theUrl, callback) {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        callback(JSON.parse(xmlHttp.responseText))
      } else {
        callback(null)
      }
    }
  }
  xmlHttp.open('GET', theUrl, true)
  xmlHttp.send(null)
}

export async function fetchAuthorNames (authors) {
  try {
    const names = await Promise.all(
      authors.map(async author => {
        const response = await fetch(
          `https://openlibrary.org${author.key}.json`
        )
        const authorData = await response.json()
        return authorData.name
      })
    )
    return names
  } catch (error) {
    console.error('Error fetching author names', error)
    return []
  }
}

export async function checkImageExists (url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error('Error checking image existence', error)
    return false
  }
}

export const getBooks = () => {
  try {
    const userDocument = databases.getDocument(
      databaseKey,
      usersCollection,
      getAccount().$id
    )
    return userDocument?.Books ? userDocument.Books : '[]'
  } catch (error) {
    console.error('Error fetching user document:', error)
    return '[]'
  }
}

export const getAccount = () => {
  const getData = account.get()
  getData.then(
    response => {
      return response
    },
    error => {
      console.log(error)
    }
  )
}
