import { Blockfrost, Lucid, SignedMessage, utf8ToHex } from "lucid-cardano"
import { initLucidWithoutWallet } from './lucid';
export interface BlockfrostAsset {
    unit: string
    quantity: string
}

export interface VotingData {
    address: string
    pollId: string
    votingWeight: number
    selection: number | null
    selectionText: string | null
    assets: string[]
    signature: string | null
    key: string | null
}

export interface VotingMessage {
    address: string
    pollId: string
    votingWeight: number
    selection: number | null
    selectionText: string | null
    assets: string[]
}

export interface MessageData {
    message: string
    signedMessage: SignedMessage
}

export const getAssets = async (address: string) => {
    var allNFTs: any = []
    var addressInfo = { nfts: allNFTs, balance: 0 }
    const data = await fetch(
        `https://cardano-testnet.blockfrost.io/api/v0/addresses/${address}`,
        {
            headers: {
                // Your Blockfrost API key
                project_id: process.env.NEXT_PUBLIC_BLOCKFROST!,
                'Content-Type': 'application/json'
            }
        }
    ).then(res => res.json());
    console.log(data)
    if (data?.error) {
        // Handle error.
        console.log("error")
    }

    const amount = data['amount']
    if (amount.length > 0) {
        amount.map(async (asset: any) => {
            //var allNFTs = []
            if (asset.unit !== "lovelace") {
                const data = await fetch(
                    `https://cardano-testnet.blockfrost.io/api/v0/assets/${asset.unit}`,
                    {
                        headers: {
                            // Your Blockfrost API key
                            project_id: process.env.NEXT_PUBLIC_BLOCKFROST!,
                            'Content-Type': 'application/json'
                        }
                    }
                ).then(res => res.json());
                const meta = data['onchain_metadata'];
                if (meta && meta.image) {
                    allNFTs.push({ ...meta, assetId: data.asset })
                } else {
                    //   console.log("nometa", data)
                }
            } else if (asset.unit === 'lovelace') {
                addressInfo.balance === asset.quantity
            }
        })
    }
    return { addressInfo }
}

export const countNfts = async (address: string, policyId: string) => {
    var allNFTs: any = []
    var addressInfo = { nfts: allNFTs, balance: 0 }
    const data = await fetch(
        `https://cardano-testnet.blockfrost.io/api/v0/addresses/${address}`,
        {
            headers: {
                // Your Blockfrost API key
                project_id: process.env.NEXT_PUBLIC_BLOCKFROST!,
                'Content-Type': 'application/json'
            }
        }
    ).then(res => res.json());
    console.log(data)
    if (data?.error) {
        // Handle error.
        console.log("error")
    }

    const amount = data['amount']
    let allAssets: string[] = [];
    let votingWeight: number = 0;
    if (amount.length > 0) {
        amount.map(async (asset: any) => {
            //var allNFTs = []
            if (asset.unit.startsWith(policyId)) {
                allAssets.push(asset.unit)
                votingWeight += parseInt(asset.quantity)
                /* const data = await fetch(
                    `https://cardano-testnet.blockfrost.io/api/v0/assets/${asset.unit}`,
                    {
                        headers: {
                            // Your Blockfrost API key
                            project_id: process.env.NEXT_PUBLIC_BLOCKFROST!,
                            'Content-Type': 'application/json'
                        }
                    }
                ).then(res => res.json());
                const meta = data['onchain_metadata'];
                if (meta && meta.image) {
                    allNFTs.push({ ...meta, assetId: data.asset })
                } else {
                    //   console.log("nometa", data)
                } */
            }
        })
    }
    return { address, votingWeight, selection: null, selectionText: "", assets: allAssets }
}

export const verifySignature = async (address: string, message: string, signedMessage: SignedMessage): Promise<boolean> => {
    const lucid = await initLucidWithoutWallet()
    const payload = utf8ToHex(message);
    const hasSigned: boolean = lucid.verifyMessage(address, payload, { key: signedMessage.key, signature: signedMessage.signature })
    return hasSigned
}
export const signMessage = async (address: string, message: string) => {
    const lucid = await initLucidWithoutWallet()
    const payload = utf8ToHex(message);
    const signedMessage = await lucid.newMessage(address, payload).sign()
    return signedMessage
}

export const createVote = async (lucid: Lucid, address: string, votingData: VotingData) => {
    const message = JSON.stringify(votingData)
    const payload = utf8ToHex(message);
    const signedMessage = await lucid.newMessage(address, payload).sign()
    return { message, signedMessage }
}

export const checkVote = async (vote: VotingData) => {
    const lucid = await initLucidWithoutWallet()
    let messageData: VotingData | any = {...vote}
    delete messageData.key
    delete messageData.signature
    const payload = utf8ToHex(JSON.stringify(messageData));
    const hasSigned: boolean = lucid.verifyMessage(messageData.address, payload, { key: vote.key!, signature: vote.signature! })
    console.log(hasSigned)
    const assets = await countNfts(messageData.address, process.env.NEXT_PUBLIC_POLICY_ID!)
    let isValid = false
    let votingWeight = 0
    for (let asset of messageData.assets) {
        let filteredAssets = assets.assets.filter((element: string) => element === asset)
        if (filteredAssets.length > 0 && hasSigned) {
            isValid = true
            votingWeight += 1
        } else {
            isValid = false
            break;
        }
    }
    return isValid && votingWeight === vote.votingWeight
}