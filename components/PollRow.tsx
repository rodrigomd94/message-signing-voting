
import { Data, UTxO } from 'lucid-cardano';
import Link from 'next/link';
import { useState } from 'react'
import { useStoreActions, useStoreState } from "../utils/store";



const PollRow = (props: any) => {
  const walletStore = useStoreState((state: any) => state.wallet)
  const poll = props.pollData
  

  return (
    <>
      {poll &&
        <tr>
          <td>{poll.id}</td>
          <td><Link href={`/poll/${poll.id}`} ><a className="link link-secondary">{poll.title}</a></Link> </td>
          <td>{poll.description}</td>
          <td>{poll.createdAt}</td>
          <td>{poll.endingAt}</td>
        </tr>}
    </>
  )
}

export default PollRow;