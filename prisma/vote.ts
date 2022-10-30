// /prisma/user.js
import { VotingData } from '../utils/cardano'
import prisma from './prisma'


// READ
export const getAllVotes = async () => {
  const votes = await prisma.vote.findMany({})
  return votes
}

export const getVote = async id => {
  const vote = await prisma.vote.findUnique({
    where: { id }
  })
  return vote
}

export const getAddressVotes = async (address: string) => {
  const votes = await prisma.vote.findMany({
    where: { address }
  })
  return votes
}

export const getAddressPollVote = async (address: string, pollId: string) => {
  const vote = await prisma.vote.findMany({
    where: { 
      AND: {
        address, 
        pollId 
      }
    }
  })
  return vote
}

export const checkAssetsUsed = async (pollId: string, addr: string, assets: string[]) => {
  let found = false
  const votes = await prisma.vote.findMany({
    where: { pollId }
  })
  for (let vote of votes) {
    found = assets.some(r => vote.assets.includes(r) && vote.address != addr)
    if(found){
      break;
    }
  }
  return found
}

//TODO: get vote from address?

// CREATE
export const createVote = async (
  address: string,
  pollId: string,
  votingWeight: number,
  selection: number | null,
  selectionText: string | null,
  assets: string[],
  signature: string | null,
  key: string | null) => {
  const vote = await prisma.vote.create({
    data: {
      address,
      pollId,
      votingWeight,
      selection,
      selectionText,
      assets,
      signature,
      key
    }
  })
  return vote
}

// UPDATE
export const updateVote = async (id: any, updateData: VotingData) => {
  const vote = await prisma.vote.update({
    where: {
      id
    },
    data: {
      ...updateData
    }
  })
  return vote
}

// DELETE
export const deleteVote = async id => {
  const vote = await prisma.vote.delete({
    where: {
      id
    }
  })
  return vote
}