import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises } from 'fs'


export const __dirname = dirname(fileURLToPath(import.meta.url))

// export async function readCsv(path) {
//   const text = await promises.readFile(path, 'utf8')

//   return dsvFormat(',').parse(text)
// }

// export function apiRequest(endpoint, query, data, sourceReq) {
//   const gqlClient = new GraphQLClient(
//     endpoint,
//     sourceReq
//       ? {
//           headers: sourceReq.headers,
//         }
//       : undefined,
//   )

//   return gqlClient.request(query, data)
// }

// export { gql }
