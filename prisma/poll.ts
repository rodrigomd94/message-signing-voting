// /prisma/user.js
import { VotingData } from '../utils/cardano'
import prisma from './prisma'


export interface PollData {
  title: string,
  description: string,
  options: string[],
  endingAt: Date
}
// READ
export const getAllPolls = async () => {
  const polls = await prisma.poll.findMany({})
  return polls
}

export const getPoll = async id => {
  const poll = await prisma.poll.findUnique({
    where: { id }
  })
  return poll
}

export const getPollVotes = async id => {
  const votes = await prisma.vote.findMany({
    where: { pollId: id }
  })
  return votes
}

export const countPollVotes = async id => {
  const poll = await prisma.poll.findUnique({
    where: { id }
  })
  const votes = await prisma.vote.findMany({
    where: { pollId: id }
  })
  const options = poll.options
  let voteCount: any = {}
  for (let option of options) {
    let filteredVotes = votes.filter((vote: VotingData) => vote.selectionText === option)
    voteCount[option] = 0
    filteredVotes.map((vote: VotingData) => {
      voteCount[option] += vote.votingWeight
    })
  }
  return voteCount
}
// CREATE
export const createPoll = async (title: string, description: string, options: string[], endingAt: Date) => {
  const poll = await prisma.poll.create({
    data: {
      title,
      description,
      options,
      endingAt
    }
  })
  return poll
}

// UPDATE
export const updatePoll = async (id: any, updateData: PollData) => {
  const poll = await prisma.poll.update({
    where: {
      id
    },
    data: {
      ...updateData
    }
  })
  return poll
}

// DELETE
export const deletePoll = async id => {
  const poll = await prisma.poll.delete({
    where: {
      id
    }
  })
  return poll
}