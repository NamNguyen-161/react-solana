import IonIcon from '@sentre/antd-ionicon'
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import brand from '../static/images/solanaLogoMark.svg'
import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'

import logo from 'static/images/solanaLogo.svg'
import './index.less'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'

function View() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [loadingAirdrop, setLoadingAirdrop] = useState<boolean>(false)
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false)
  const [balance, setBalance] = useState<number>(0)

  const getMyBalance = useCallback(async () => {
    if (!publicKey) return setBalance(0)
    const lamports = await connection.getBalance(publicKey)
    setBalance(lamports)
  }, [publicKey, connection])

  const transaction = useCallback(async () => {
    if (!publicKey) return
    try {
      setLoadingTransfer(true)
      const minimumLamports =
        await connection.getMinimumBalanceForRentExemption(0)
      const instruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: minimumLamports,
      })

      const transaction = new Transaction().add(...[instruction])
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext()

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      })

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })
      await getMyBalance()
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingTransfer(false)
    }
  }, [publicKey, connection, getMyBalance, sendTransaction])

  const airDrop = useCallback(
    async (lamports: number) => {
      if (!publicKey) return
      try {
        setLoadingAirdrop(true)
        const airDropSignature = await connection.requestAirdrop(
          publicKey,
          lamports,
        )

        await connection.confirmTransaction(airDropSignature)
        await getMyBalance()
      } catch (error) {
        console.log({ error })
      } finally {
        setLoadingAirdrop(false)
      }
    },
    [connection, getMyBalance, publicKey],
  )

  useEffect(() => {
    getMyBalance()
  }, [connection, publicKey, getMyBalance])

  return (
    <Layout className="container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col flex="auto">
              <img alt="logo" src={brand} height={16} />
            </Col>
            <Col>
              <WalletMultiButton />
            </Col>
          </Row>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={24}>
            <Image src={logo} preview={false} width={256} />
            <Typography.Title level={1}>React + Solana = DApp</Typography.Title>
            <Typography.Text type="secondary">
              <Space>
                <IonIcon name="logo-react" />
                +
                <IonIcon name="logo-solana" />
                =
                <IonIcon name="rocket" />
              </Space>
            </Typography.Text>
            {/* <Button type="primary" size="large">
              Let's go
            </Button> */}

            <Typography.Title level={1} type="secondary">
              SOL: {balance / 10 ** 9}
            </Typography.Title>

            <Button
              type="primary"
              size="large"
              loading={loadingAirdrop}
              onClick={() => airDrop(LAMPORTS_PER_SOL)}
            >
              Airdrop
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loadingTransfer}
              onClick={transaction}
            >
              Transfer
            </Button>
          </Space>
        </Col>
      </Row>
    </Layout>
  )
}

export default View
