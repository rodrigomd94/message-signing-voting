import { Blockfrost, Lucid, SignedMessage, utf8ToHex } from "lucid-cardano"

export interface BlockfrostAsset {
    unit: string
    quantity: string
}

export interface VotingData {
    address: string
    votingWeight: number
    allAssets: BlockfrostAsset[]
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
    let allAssets: BlockfrostAsset[] = [];
    let votingWeight: number = 0;
    if (amount.length > 0) {
        amount.map(async (asset: any) => {
            //var allNFTs = []
            if (asset.unit.startsWith(policyId)) {
                allAssets.push(asset)
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
    return { address, allAssets, votingWeight }
}

export const verifySignature = (lucid: Lucid, address: string, message: string, signedMessage: SignedMessage): boolean => {
    const payload = utf8ToHex(message);
    const hasSigned: boolean = lucid.verifyMessage(address, payload, { key: signedMessage.key, signature: signedMessage.signature })
    return hasSigned
}
export const signMessage = async (lucid: Lucid, address: string, message: string) => {
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

export const checkVote = async (address: string, messageData: MessageData) => {
    const lucid = await Lucid.new(
        new Blockfrost("https://cardano-testnet.blockfrost.io/api/v0", process.env.NEXT_PUBLIC_BLOCKFROST!),
        "Testnet",
    );
    const payload = utf8ToHex(messageData.message);
    const hasSigned: boolean = lucid.verifyMessage(address, payload, { key: messageData.signedMessage.key, signature: messageData.signedMessage.signature })
    const parsedAssets: BlockfrostAsset[] = JSON.parse(messageData.message).allAssets
    const assets = await countNfts(address, process.env.NEXT_PUBLIC_POLICY_ID!)
    let isValid = false
    for (let asset of parsedAssets) {
        let filteredAssets = assets.allAssets.filter((element: BlockfrostAsset) => element.unit === asset.unit)
        if (filteredAssets.length > 0 && hasSigned) {
            isValid = true
        } else {
            isValid = false
            break;
        }
    }
    return isValid
}