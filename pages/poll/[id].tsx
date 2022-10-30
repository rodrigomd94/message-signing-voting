
import { Data, Lucid, utf8ToHex, UTxO } from 'lucid-cardano';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import LoadingModal from '../../components/LoadingModal';
import MessageModal from '../../components/MessageModal';
import WalletConnect from '../../components/WalletConnect';
import { countNfts, createVote, VotingData, VotingMessage } from '../../utils/cardano';
import initLucid from '../../utils/lucid';
import { useStoreActions, useStoreState } from "../../utils/store";



const PollRow = (props: any) => {
  const walletStore = useStoreState((state: any) => state.wallet)
  const [poll, setPoll] = useState<any>()
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState<boolean>(false)
  const [displayMessage, setDisplayMessage] = useState<{ title: string, message: string }>({ title: "", message: "" })
  const [showModal, setShowModal] = useState<boolean>(false)
  const [votingMessage, setVotingMessage] = useState<VotingMessage>()
  const [selectedOption, setSelectedOption] = useState<number>()
  const [lucid, setLucid] = useState<Lucid>()
  const [existingVote, setExistingVote] = useState<VotingData | undefined>()


  useEffect(() => {
    if (id) {
      fetch("../api/poll?id=" + id)
        .then(res => { return res.json() })
        .then(data => { setPoll(data) })
    }

  }, [id])
  useEffect(() => {
    if (lucid) {
      countNfts(walletStore.address, process.env.NEXT_PUBLIC_POLICY_ID!)
        .then((data) => { setVotingMessage({ ...data, pollId: id as string }) })
      fetch(`../api/getAddressPollVote?address=${walletStore.address}&id=${id}`)
        .then(res => res.json())
        .then((data) => { setExistingVote(data[0]) })
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) })
    }
  }, [lucid])

  const submitVote = async () => {
    const newVoteMessage = { ...votingMessage, pollId: id, selection: selectedOption, selectionText: poll.options[selectedOption!] }
    const message = JSON.stringify(newVoteMessage)
    const payload = utf8ToHex(message);
    const signedMessage = await lucid!.newMessage(walletStore.address, payload).sign()
    //const messageData = await createVote(lucid!, walletStore.address, votingData!)
    const response = await fetch("../api/submitVote", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "address": walletStore.address,
        "messageData": {
          ...newVoteMessage,
          signature: signedMessage.signature,
          key: signedMessage.key
        },
      }),
    });

    response.json().then(data => {
      console.log(data);
    });
  }

  return (
    <>
      {poll &&
        <div className="px-10">
          <MessageModal message={displayMessage.message} active={showModal} title={displayMessage.title} />
          <LoadingModal active={loading} />
          <div className="navbar bg-base-100">
            <div className="flex-1">
              <Link href="/" className="btn btn-ghost normal-case text-xl">Cardano</Link>
            </div>
            <div className="flex-none">
              <WalletConnect />
            </div>
          </div>
          <div className="hero-content flex-col ">
            <div className="card flex-shrink-0 w-full max-w-lg shadow-2xl bg-base-100">
              <div className="card-body">
                <div className="text-left">
                  {/* <WalletConnect /> */}
                  <h1 className="text-3xl mb-5 font-bold">{poll.title}</h1>
                  {existingVote &&
                    <>
                      <h1 className="text-xl mb-2 text-warning font-bold">You have already voted on this poll!</h1>
                      <p className='text-warning' >Voting again will update your vote.</p>
                      <p className="break-all text-warning text-secondary">Your selection: <b>{existingVote.selection!+1}. {existingVote.selectionText}</b> </p>
                      <p className="text-warning mb-5 break-all text-secondary">Your voting weight: <b>{existingVote.votingWeight}</b></p>
                    </>
                  }
                  <h1 className="text-xl font-bold">Description</h1>
                  <p className="py-2 break-all text-secondary">{poll.description}</p>
                  <h1 className="text-xl font-bold mb-2">Options:</h1>
                  <div className="form-control w-full max-w-xs">
                    <select onChange={(e) => { setSelectedOption(parseInt(e.target.value))}} className="select select-bordered">
                      <option disabled selected={!Boolean(selectedOption)}>Select</option>
                      {poll.options.map((option: string, index: number) => <option value={index} className="text-secondary" key={index} >{index + 1}. {option}</option>)}
                    </select>
                  </div>
                  <h1 className="text-xl mt-5 font-bold">Your voting weight:</h1>
                  <p className="py-2 break-all text-secondary">{votingMessage?.votingWeight}</p>
                  <h1 className="text-xl mt-5 font-bold">Poll ends on:</h1>
                  <p className="py-2 break-all text-secondary">{poll?.endingAt}</p>
                </div>
              </div>
              <div className="mx-40 my-10">
                <button disabled={!Boolean(selectedOption) && selectedOption!==0} className="btn btn-primary m-5" onClick={() => { submitVote() }} >Submit Vote</button>
              </div>

            </div>

          </div>

        </div>
      }
    </>
  )
}

export default PollRow;