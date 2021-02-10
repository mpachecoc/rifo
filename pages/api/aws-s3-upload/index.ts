import type { NextApiRequest, NextApiResponse } from 'next'
import S3 from 'aws-sdk/clients/s3'

import uploadConfig from '../../../config/upload'

const s3 = new S3({
  region: uploadConfig.config.awsRegion,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3,
  signatureVersion: 'v4'
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const { filename, type } = request.body

    const fileParams = {
      Bucket: uploadConfig.config.awsBucket,
      Key: filename,
      ACL: 'public-read',
      ContentType: type,
      Expires: 600
    }

    // Get putObject route for AWS according to filename & type
    const url = await s3.getSignedUrlPromise('putObject', fileParams)

    response.statusCode = 201
    response.json({ url })
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
