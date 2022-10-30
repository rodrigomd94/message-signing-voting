
import { Lucid } from 'lucid-cardano';
import { useState, useEffect } from 'react'
import initLucid from '../utils/lucid';
import { useStoreActions, useStoreState } from "../utils/store";
import PollRow from './PollRow';
// table where the customer can see his active subscriptions
const PollsTable = (props: any) => {
    const subscriptionList = props.polls
    const [lucid, setLucid] = useState<Lucid>()
    const walletStore = useStoreState((state: any) => state.wallet)
    const [allPolls, setAllPolls] = useState([])

    useEffect(() => {
        fetch('api/poll')
        .then(res=>res.json())
        .then(data=>{console.log(data); setAllPolls(data)})
        if (!lucid) {
            initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) })
        } else {
            console.log("connected")
        }
    }, [])
    return (
        <>
            {allPolls.length > 0 &&
                <div className="overflow-x-auto my-5">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Created At</th>
                                <th>Ending Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPolls.map((poll: any, index: number) => {
                                return <PollRow key={index} pollData={poll}/>
                            })}
                        </tbody>
                    </table>
                </div>}
                {allPolls.length === 0 && 
                <div>No polls</div>}

        </>
    )
}

export default PollsTable;