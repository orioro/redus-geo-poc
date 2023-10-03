'use client'
import dynamic from 'next/dynamic'

const Demo1 = dynamic(
  () => import('../components/Demo1').then((mod) => mod.Demo1),
  {
    ssr: false,
  },
)

export default Demo1
