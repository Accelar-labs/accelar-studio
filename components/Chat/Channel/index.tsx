/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
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
import './try.css'
import { getChannel, getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import { getUserChannels, newMessageChannel } from '@/utils/api-chat'
import { ChannelProps } from '@/types/chat'
import { AccountContext } from '@/contexts/AccountContext'
import { channelTypeToLogo } from '@/types/consts/chat'
import DeleteMessageModal from './DeleteMessageModal'
import dynamic from 'next/dynamic'

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const Channel = (id: any) => {
  const { push } = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { channel, setChannel } = useContext(AccountContext)
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isDeleteInfoOpen, setIsDeleteInfoOpen] = useState<any>()
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState<any>()
  const [isEditMessageOpen, setIsEditMessageOpen] = useState<any>()
  const [isMessageHovered, setIsMessageHovered] = useState<any>()
  const [editorHtml, setEditorHtml] = useState('')
  const [newMessageHtml, setNewMessageHtml] = useState('')

  function handleChangeEditor(value) {
    if (editorHtml.length < 5000) {
      setEditorHtml(value)
    }
  }

  function handleChangeNewMessage(value) {
    if (editorHtml.length < 5000) {
      setNewMessageHtml(value)
    }
  }

  const menuRef = useRef(null)

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    setIsLoading(true)
    console.log('getting channels')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getChannel(data, userSessionToken)
      setChannel(dado)
      setIsLoading(false)
    } catch (err) {
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return dado
  }

  function formatDate(createdAt) {
    const date = new Date(createdAt)
    const now = new Date()

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (isToday) {
      return `Today ${formattedTime}`
    } else {
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      return `${formattedDate} ${formattedTime}`
    }
  }

  function formatDateWithoutTime(createdAt) {
    const date = new Date(createdAt)
    const now = new Date()

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return `${formattedDate}`
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      getData(id.id)
    }
  }, [id])

  const closeMenu = () => {
    setIsDeleteMessageOpen(false)
  }

  const editSave = () => {
    console.log('message saved')
    setIsEditMessageOpen(false)
  }

  const newMessageSave = () => {
    console.log('new message saved')
    handleNewMessage(newMessageHtml)
  }

  const handleNewMessage = async (messageContent: string) => {
    const { userSessionToken } = parseCookies()
    const data = {
      channelId: id.id,
      message: messageContent,
    }

    try {
      await newMessageChannel(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  const handleMessageDeleted = (messageId: string) => {
    const arrayChannel = { ...channel }
    const finalArrayMessages = channel?.messages.filter(
      (item) => item.id !== messageId,
    )
    arrayChannel.messages = finalArrayMessages
    setChannel(arrayChannel)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteMessageOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteMessageOpen])

  const handleKeyPress = (event) => {
    console.log('key press called')
    if (isEditMessageOpen) {
      if (
        event.key === 'Enter' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        editSave()
      } else if (event.key === 'Escape') {
        setIsEditMessageOpen(false)
      }
    } else {
      if (
        event.key === 'Enter' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        newMessageSave()
      }
    }
  }

  function isDifferentDay(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return (
      d1.getDate() !== d2.getDate() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getFullYear() !== d2.getFullYear()
    )
  }

  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener('keydown', handleKeyPress)

    // Remove o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isEditMessageOpen, newMessageHtml])

  return (
    <>
      <div className="relative flex  w-full overflow-y-hidden  bg-[#1D2144]  pb-16 text-[16px] text-[#C5C4C4] md:pb-20 lg:mt-[100px] lg:pb-28  2xl:text-[18px]">
        <div className="w-full">
          <div className="w-full border-b-[1px] border-[#141733] bg-[#1D2144] px-[40px] py-[20px]">
            <div className="flex gap-x-[5px]">
              <img
                src={channelTypeToLogo[channel?.type]}
                alt="image"
                className={'w-[16px] 2xl:w-[18px]'}
              />
              <div>{channel?.name}</div>
              {channel?.isPrivate && (
                <img
                  src={'/images/chat/lock.svg'}
                  alt="image"
                  className={'ml-[5px] w-[14px] 2xl:w-[16px]'}
                />
              )}
            </div>
          </div>
          <div className="flex h-full w-full items-end">
            <div className="w-full">
              <div className="pt-[50px] text-[12px] font-light 2xl:text-[14px]">
                {channel?.messages?.map((message, index) => {
                  const showDaySeparator =
                    index === 0 ||
                    isDifferentDay(
                      message.createdAt,
                      channel.messages[index - 1].createdAt,
                    )

                  return (
                    <div key={message.id}>
                      {showDaySeparator && (
                        <div className="day-separator">
                          {formatDateWithoutTime(message?.createdAt)}
                        </div>
                      )}
                      <div
                        onMouseEnter={() => setIsMessageHovered(message.id)}
                        onMouseLeave={() => {
                          if (!isDeleteMessageOpen) {
                            setIsMessageHovered(null)
                          }
                        }}
                        className="flex items-start gap-x-[10px] px-[40px]  py-[20px] hover:bg-[#24232e63] 2xl:gap-x-[15px]"
                      >
                        <img
                          alt="ethereum avatar"
                          src={message?.userWorkspace?.user?.profilePicture}
                          className="max-w-[35px] rounded-full"
                        ></img>
                        <div>
                          <div className="flex h-fit gap-x-[9px]">
                            <div>{message?.userWorkspace?.user?.name} </div>
                            <div className="my-auto text-[10px] text-[#888888] 2xl:text-[12px]">
                              {formatDate(message?.createdAt)}
                            </div>
                          </div>
                          {isEditMessageOpen ? (
                            <>
                              <QuillNoSSRWrapper
                                value={editorHtml}
                                onChange={handleChangeEditor}
                                // disabled={isLoading}
                                className="my-quill mt-2 w-[280px]  rounded-md bg-[#787ca536] text-base font-normal text-[#fff] outline-0 lg:w-[900px]"
                                // maxLength={5000}
                                placeholder="Type here"
                              />
                              <div className="mt-[10px] text-[10px]">
                                enter to{' '}
                                <span className="text-[#fff]">save</span> - esc
                                to <span className="text-[#fff]">cancel</span>
                              </div>
                            </>
                          ) : (
                            <div>{message.content}</div>
                          )}
                        </div>
                        {isMessageHovered === message.id && (
                          <div className="relative ml-auto flex items-center gap-x-[10px]">
                            <div>
                              {' '}
                              {isEditInfoOpen === message.id && (
                                <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                                  Edit
                                </div>
                              )}
                              <img
                                alt="ethereum avatar"
                                src="/images/chat/pencil.svg"
                                className="w-[20px] cursor-pointer 2xl:w-[25px]"
                                onMouseEnter={() =>
                                  setIsEditInfoOpen(message.id)
                                }
                                onMouseLeave={() => setIsEditInfoOpen(null)}
                                onClick={() => {
                                  setIsEditMessageOpen(message.id)
                                }}
                              ></img>{' '}
                            </div>
                            <div>
                              {' '}
                              {isDeleteInfoOpen === message.id && (
                                <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[120%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                                  Delete
                                </div>
                              )}
                              {isDeleteMessageOpen === message.id && (
                                <div
                                  ref={menuRef}
                                  className="absolute z-50   -translate-x-[100%]  -translate-y-[120%]"
                                >
                                  <DeleteMessageModal
                                    messageId={message.id}
                                    onUpdateM={() => {
                                      handleMessageDeleted(message.id)
                                    }}
                                  />{' '}
                                </div>
                              )}
                              <img
                                alt="ethereum avatar"
                                src="/images/delete.svg"
                                className="w-[14px] cursor-pointer 2xl:w-[18px]"
                                onMouseEnter={() =>
                                  setIsDeleteInfoOpen(message.id)
                                }
                                onMouseLeave={() => setIsDeleteInfoOpen(null)}
                                onClick={() => {
                                  setIsDeleteMessageOpen(message.id)
                                }}
                              ></img>{' '}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-[30px] w-full px-[40px]">
                {' '}
                <QuillNoSSRWrapper
                  value={newMessageHtml}
                  onChange={handleChangeNewMessage}
                  // disabled={isLoading}
                  className="my-quill mt-2 w-full rounded-md  bg-[#787ca536] text-base font-normal text-[#fff] outline-0"
                  placeholder="Type here"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Channel
