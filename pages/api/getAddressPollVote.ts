// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAddressPollVote } from '../../prisma/vote';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const addr: string = req.query.address as string
  const vote = await getAddressPollVote(addr, req.query.id as string)
  res.status(200).json(vote)
}
