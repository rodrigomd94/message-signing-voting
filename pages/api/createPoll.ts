// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from '../../utils/cardano'
import { PollData, createPoll } from '../../prisma/poll';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const isAdmin = req.body.address === process.env.NEXT_ADMIN_ADDR
  const isValid: boolean = isAdmin && await verifySignature(req.body.address, JSON.stringify(req.body.pollData), req.body.signedMessage)
  console.log("is valid:", isValid)
  if(isValid){
    const { title, description, options, endingAt } = req.body.pollData
    const poll = await createPoll(title, description, options, endingAt)
    //return res.json(poll)
    res.status(200).json(poll)

  } else{
    res.status(401).json({error: `The address ${req.body.address} is not authorized to create polls.`})
  }
}
