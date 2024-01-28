/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import nookies, { parseCookies, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
// import NewWorkspaceModal from './NewWorkspace'
import { getBlockchainApps, getUserWorkspace, getWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import SubNavBar from '../Modals/SubNavBar'
import { Logo } from '../Sidebar/Logo'
import { BlockchainAppProps } from '@/types/blockchain-app'
import AppsRender from './AppsRender'
import NewAppModal from './Modals/NewAppModal'

const BlockchainAppsPage = ({ id }) => {
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [navBarSelected, setNavBarSelected] = useState('General')
  const [blockchainApps, setBlockchainApps] = useState<BlockchainAppProps[]>([])

  const { workspace, user } = useContext(AccountContext)

  async function getData() {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getBlockchainApps(data, userSessionToken)
      setBlockchainApps(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[90px]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="flex">
              <div className="mt-auto text-[24px] font-medium">
                Blockchain apps
              </div>
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={() => {
                  setIsCreatingNewApp(true)
                }}
                className="cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
              >
                New app
              </div>
            )}
          </div>
          <div className="mt-[45px]">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['General']}
            />
            <div className="mt-[50px]">
              {navBarSelected === 'General' && (
                <AppsRender
                  apps={blockchainApps}
                  isUserAdmin={workspace?.isUserAdmin}
                  onUpdate={getData}
                />
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        <NewAppModal
          isOpen={isCreatingNewApp}
          onClose={() => {
            setIsCreatingNewApp(false)
          }}
          onChannelCreated={() => {
            getData()
          }}
          workspaceId={id.id}
        />
      </section>
    </>
  )
}

export default BlockchainAppsPage
