// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { countPollVotes } from '../../prisma/poll'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const voteCount = await countPollVotes(req.query.id)
  res.status(200).json(voteCount)
}
