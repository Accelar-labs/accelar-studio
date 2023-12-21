/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import { getUserChannels } from '@/utils/api-chat'
import { ChannelProps } from '@/types/chat'
import NewChannelModal from '../Modals/NewChannelModal'
import { AccountContext } from '@/contexts/AccountContext'

const ChatSidebar = (id: any) => {
  const [channels, setChannels] = useState<ChannelProps[]>()
  const [isCreatingNewChannel, setIsCreatingNewChannel] = useState(false)
  const [isCreatingNewChannelType, setIsCreatingNewChannelType] = useState('')
  const { workspace, setWorkspace } = useContext(AccountContext)

  const [sidebarOption, setSidebarOption] = useState<any>({
    TEXT: true,
    AUDIO: true,
    VIDEO: true,
  })

  const channelOption = [
    {
      name: 'TEXT CHATS',
      type: 'TEXT',
    },
    {
      name: 'AUDIO CHATS',
      type: 'AUDIO',
    },
    {
      name: 'VIDEO CHATS',
      type: 'VIDEO',
    },
  ]

  const handleSidebarClick = (type) => {
    const newSideBar = { ...sidebarOption }
    newSideBar[type] = !sidebarOption[type]

    console.log('newSidebar')
    console.log(newSideBar)
    setSidebarOption(newSideBar)
  }

  const closeModal = () => {
    setIsCreatingNewChannel(false)
  }

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    console.log('getting channels')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getUserChannels(data, userSessionToken)
      console.log('channels q recebi')
      console.log(dado)
      setChannels(dado)
    } catch (err) {
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return dado
  }

  useEffect(() => {
    if (id) {
      console.log(id)
      console.log(id.id)
      getData(id.id)
    }
  }, [id])

  return (
    <>
      <div className="relative z-10 flex h-screen w-fit overflow-hidden bg-[#33323E] px-[10px] pb-16 pt-5 text-[16px] md:pb-20 lg:mt-[100px] lg:pb-28">
        <div className="text-[10px] font-semibold text-[#C5C4C4]">
          {channelOption.map((option, index) => (
            <div key={index} className="mb-[30px]">
              <div
                onClick={() => {
                  handleSidebarClick(option.type)
                }}
                className={`flex min-w-[150px] items-center`}
              >
                <div className="flex cursor-pointer gap-x-[5px] hover:text-[#fff]">
                  <img
                    src="/images/chat/arrow-down.svg"
                    alt="image"
                    className={`w-[8px]  ${
                      !sidebarOption[option.type] && '-rotate-90'
                    }`}
                  />
                  <div>{option.name}</div>
                </div>

                {workspace?.isUserAdmin && (
                  <div
                    onClick={() => {
                      setIsCreatingNewChannel(true)
                      setIsCreatingNewChannelType(option.type)
                    }}
                    className="ml-auto cursor-pointer text-[17px] font-light hover:text-[#fff]"
                  >
                    +
                  </div>
                )}
              </div>
              {sidebarOption[option.type] &&
                channels &&
                channels?.length > 0 && (
                  <div>
                    {channels?.map((optionChannel, index) => (
                      <div key={index}>
                        {option.type === optionChannel.type && (
                          <div> {optionChannel.name} </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
      <NewChannelModal
        isOpen={isCreatingNewChannel}
        onClose={closeModal}
        channelType={isCreatingNewChannelType}
        workspaceId={id.id}
      />
    </>
  )
}

export default ChatSidebar
