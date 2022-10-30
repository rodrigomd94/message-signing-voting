import type { NextPage } from 'next'
import Head from 'next/head'
import WalletConnect from '../components/WalletConnect'
import { useStoreActions, useStoreState } from "../utils/store"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { checkVote, countNfts, createVote, getAssets, VotingData } from "../utils/cardano";
import initLucid from '../utils/lucid'
import { Lucid, TxHash, Lovelace, Constr, SpendingValidator, Data, utf8ToHex } from 'lucid-cardano'
import { PollData } from '../prisma/poll'
import LoadingModal from '../components/LoadingModal'
import MessageModal from '../components/MessageModal'


const CreatePoll: NextPage = () => {
  const walletStore = useStoreState((state: any) => state.wallet)
  const [lucid, setLucid] = useState<Lucid>()
  const [pollTitle, setPollTitle] = useState<string>("")
  const [pollDescription, setPollDescription] = useState<string>("")
  const [options, setOptions] = useState<string[]>([])
  const [currentOption, setCurrentOption] = useState<string>("")
  const [endingDate, setEndingDate] = useState<Date>()
  const [durationUnit, setDurationUnit] = useState("Days")
  const [duration, setDuration] = useState<number>(0)
  const durationOptions = ["Days", "Hours"]

  const [link, setLink] = useState({url:"", text:""})
  const [loading, setLoading] = useState<boolean>(false)
  const [displayMessage, setDisplayMessage] = useState<{ title: string, message: string }>({ title: "", message: "" })
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    if (lucid) {
      console.log("connected")
      setShowModal(false)
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) })
    }
  }, [lucid])

  const createPoll = async () => {
    if (pollDescription && pollTitle && endingDate && options.length > 0) {
      const pollData: PollData = {
        title: pollTitle,
        description: pollDescription,
        options: options,
        endingAt: endingDate
      }
      console.log(pollData)
      console.log(JSON.stringify(pollData))
      const message = JSON.stringify(pollData)
      const payload = utf8ToHex(message);
      const signedMessage = await lucid!.newMessage(walletStore.address, payload).sign()
      setLoading(true)

      const response = await fetch("api/createPoll", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "address": walletStore.address,
          "pollData": pollData,
          "signedMessage": signedMessage
        }),
      });

      response.json().then(data => {
        console.log(data);
        setEndingDate(undefined)
        setPollTitle("")
        setPollDescription("")
        setOptions([])
        setDuration(0)
        setLoading(false)
        if(data.error){
        setDisplayMessage({ title: "Error!", message: data.error})
        setLink({url:"", text:""})
        }else{
          setDisplayMessage({ title: "Success!", message: "Poll successfully saved."})
          setLink({url:"/poll/"+data.id, text:"Go to poll."})
        }
        setShowModal(true)
      });
      console.log(message)
    } else {
      console.log("Poll not filled")
      setDisplayMessage({ title: "Missing fields.", message: "Some fields need to be filled properly" })
      setShowModal(true)
    }

  }

  const calculateDate = (duration: number, durationUnit: string) => {
    const conversion: any = {
      "Days": 24 * 60 * 60 * 1000,
      "Hours": 60 * 60 * 1000
    }
    const msDuration = duration * conversion[durationUnit]
    setEndingDate(new Date(Date.now() + msDuration))
    console.log(new Date(Date.now() + msDuration))
  }


  return (
    <div className="px-10">
      <MessageModal message={displayMessage.message} active={showModal} title={displayMessage.title} link={link} />
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
            <div className="text-center">
              <h1 className="text-3xl mb-5 font-bold">Create Poll</h1>
              {/* <WalletConnect /> */}
              <h1 className="text-xl font-bold">Your Address:</h1>
              <p className="py-4 break-all">{walletStore.address}</p>
              <div className="form-control w-full max-w-xs">
                <label className="label mt-5">
                  <span className="label-text">Poll title</span>
                  <span className="label-text-alt">e.g.: SpaceBudz poll</span>
                </label>
                <input type="text" placeholder="Enter title" value={pollTitle} onChange={(e) => { setPollTitle(e.target.value) }} className="input input-bordered w-full max-w-xs" />

                <label className="label mt-5">
                  <span className="label-text">Poll description</span>
                </label>
                <textarea placeholder="Enter description" value={pollDescription} onChange={(e) => { setPollDescription(e.target.value) }} className="textarea textarea-bordered w-full max-w-xs" />

                <div className="form-control mt-5">
                  <label className="label">
                    <span className="label-text">Add options</span>
                  </label>
                  <ul className="text-left mb-2">
                    {options.map((option: string, index) => <li className="text-secondary" key={index} >{index + 1}. {option}</li>)}
                  </ul>
                  <div className="input-group">
                    <input type="text" placeholder="Add option..." className="input input-bordered" value={currentOption} onChange={(e) => { setCurrentOption(e.target.value) }} />
                    <button className="btn btn-square" onClick={() => { setOptions([...options, currentOption]); setCurrentOption("") }} >
                      +
                    </button>
                  </div>
                </div>


                <div className="form-control mt-5">
                  <label className="label">
                    <span className="label-text">Poll duration</span>
                  </label>
                  <div className="input-group">
                    <input type="number" placeholder="duration" value={duration} className="input input-bordered" onChange={(e) => { setDuration(parseInt(e.target.value)); calculateDate(parseInt(e.target.value), durationUnit) }} />
                    <select onChange={(e) => { setDurationUnit(e.target.value); calculateDate(duration, e.target.value) }} className="select select-bordered">
                      {/* <option disabled selected>{durationUnit}</option> */}
                      {durationOptions.map((unit: string, index) => <option selected={unit === durationUnit ? true : false} value={unit} key={index}>{unit}</option>)}
                    </select>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">End date: {endingDate?.toString()}</span>
                  </label>
                </div>

              </div>
            </div>

          </div>
        </div>
        <div className="mx-40 my-10">
          <button className="btn btn-primary m-5" onClick={() => { createPoll() }} >Create Poll</button>
        </div>
      </div>

    </div>
  )
}

export default CreatePoll
