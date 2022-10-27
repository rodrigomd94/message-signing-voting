import type { NextPage } from 'next'
import Head from 'next/head'
import WalletConnect from '../components/WalletConnect'
import { useStoreActions, useStoreState } from "../utils/store"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { checkVote, countNfts, createVote, getAssets, VotingData } from "../utils/cardano";
import initLucid from '../utils/lucid'
import { Lucid, TxHash, Lovelace, Constr, SpendingValidator, Data } from 'lucid-cardano'


const Voting: NextPage = () => {
  const walletStore = useStoreState((state: any) => state.wallet)
  const [nftList, setNftList] = useState([])
  const [lucid, setLucid] = useState<Lucid>()
  const [script, setScript] = useState<SpendingValidator>()
  const [scriptAddress, setScriptAddress] = useState("")
  const [votingData, setVotingData] = useState<VotingData>()


  useEffect(() => {
    if (lucid) {
      countNfts(walletStore.address, process.env.NEXT_PUBLIC_POLICY_ID!)
        .then((data) => { setVotingData(data); console.log(data) })
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) })
    }
  }, [lucid])

  const vote = async () => {
    const messageData = await createVote(lucid!, walletStore.address, votingData!)
    console.log(messageData)
    console.log(JSON.stringify(messageData))
    const response = await fetch("api/submitVote", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      "address": walletStore.address,
      "messageData": JSON.stringify(messageData),
      }),
    });

    response.json().then(data => {
      console.log(data);
    });
    console.log(messageData)
  }


  return (
    <div className="px-10">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">Cardano</Link>
        </div>
        <div className="flex-none">
          <WalletConnect />
        </div>
      </div>
      <div>Address: {walletStore.address}</div>
      <div className='m-10'>
        <p>Voting Weight: {votingData?.votingWeight}</p>
        <p>
          asd
        </p>

      </div>
      <div className="mx-40 my-10">
        <button className="btn btn-primary m-5" onClick={() => { vote() }} >Deposit</button>
      </div>
    </div>
  )
}

export default Voting
