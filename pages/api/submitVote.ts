// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getPoll } from '../../prisma/poll'
import { createVote, checkAssetsUsed, getAddressPollVote, updateVote } from '../../prisma/vote';
import { checkVote } from '../../utils/cardano';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const poll = await getPoll(req.body.messageData.pollId)
  const isValid: boolean = await checkVote(req.body.messageData)
  const isExpired: boolean = Date.parse(poll.endingAt) < Date.now()
  const addr: string = req.body.messageData.address

  const assetsUsed: boolean = await checkAssetsUsed(poll.id, addr, req.body.messageData.assets)
  const existingVote = await getAddressPollVote(addr, poll.id)

  if (!assetsUsed && isValid && !isExpired && poll.options.includes(req.body.messageData.selectionText) && req.body.messageData.selectionText === poll.options[req.body.messageData.selection]) {
    const {
      address,
      pollId,
      votingWeight,
      selection,
      selectionText,
      assets,
      signature,
      key
    } = req.body.messageData

    if (existingVote.length > 0) {
      const vote = await updateVote(
        existingVote[0].id, {
        address,
        pollId,
        votingWeight,
        selection,
        selectionText,
        assets,
        signature,
        key
      }
      )
      res.status(200).json(vote)
    } else {
      const vote = await createVote(
        address,
        pollId,
        votingWeight,
        selection,
        selectionText,
        assets,
        signature,
        key
      )
      res.status(200).json(vote)
    }

  } else if (assetsUsed) {
    res.status(400).json({ error: "At least one of your assets have already been used to vote on this poll." })
  } else if (isExpired) {
    res.status(400).json({ error: "This poll is closed." })
  } else {
    res.status(400).json({ error: "Bad request" })
  }
}
