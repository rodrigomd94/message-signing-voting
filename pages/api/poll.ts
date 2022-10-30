import { NextApiRequest, NextApiResponse } from 'next'
import {
  createPoll,
  deletePoll,
  getAllPolls,
  getPoll,
  updatePoll
} from '../../prisma/poll'

export default async function handle (
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    switch (req.method) {
      case 'GET': {
        if (req.query.id) {
          // Get a single poll if id is provided is the query
          // api/poll?id=1
          const poll = await getPoll(req.query.id)
          console.log(req.query.id)
          return res.status(200).json(poll)
        } else {
          // Otherwise, fetch all polls
          const polls = await getAllPolls()
          return res.json(polls)
        }
      }
      case 'POST': {
        // Create a new poll
        const { title, description, options, endingAt } = req.body
        const poll = await createPoll(title, description, options, endingAt)
        return res.json(poll)
      }
      case 'PUT': {
        // Update an existing poll
        const { id, ...updateData } = req.body
        const user = await updatePoll(id, updateData)
        return res.json(user)
      }
      case 'DELETE': {
        // Delete an existing poll
        const { id } = req.body
        const poll = await deletePoll(id)
        return res.json(poll)
      }
      default:
        break
    }
  } catch (error: any) {
    return res.status(500).json({ ...error, message: error.message })
  }
}