// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {checkVote, countNfts} from '../../utils/cardano'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const isValid: boolean = await checkVote(req.body.address, JSON.parse(req.body.messageData))
  res.status(200).json(isValid)
}
