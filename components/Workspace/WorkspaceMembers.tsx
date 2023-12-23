/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
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
import {
  createWorkspace,
  inviteUserToWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { UserWorkspaceProps } from '@/types/workspace'
import UserWorkspaceInfoModal from './UserWorkspaceInfoModal'

export interface WorkspaceMembersI {
  id: string
  users: UserWorkspaceProps[]
}

const WorkspaceMembers = ({ id, users }: WorkspaceMembersI) => {
  const [memberEmailToAdd, setMemberEmailToAdd] = useState<string>()
  const [isLoading, setIsLoading] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()

  const [selected, setSelected] = useState<any>('normal')

  const optionsMembers = [
    {
      name: 'Member',
      value: 'normal',
    },
    {
      name: 'Admin',
      value: 'admin',
    },
  ]
  const handleInputChange = (e) => {
    if (!isLoading) {
      setMemberEmailToAdd(e.target.value)
    }
  }

  const handleInviteMember = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()
    if (memberEmailToAdd.length > 0) {
      const data = {
        role: selected,
        userEmail: memberEmailToAdd,
        id,
      }

      try {
        await inviteUserToWorkspace(data, userSessionToken)
        toast.success(`Success`)
        setMemberEmailToAdd('')
      } catch (err) {
        console.log(err)
        toast.error(`Error: ${err.response.data.message}`)
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="pb-[80px] text-[14px] text-[#C5C4C4]">
      <div className="">
        <label htmlFor="workspaceName" className="mb-4 block text-[16px]">
          Invite member to workspace
        </label>
        <div className="flex h-[33px] gap-x-[20px]">
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            maxLength={100}
            placeholder="john.doe@gmail.com"
            value={memberEmailToAdd}
            onChange={handleInputChange}
            className="w-[300px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
          />
          <select
            className="w-[100px] rounded-md bg-[#242B51] bg-transparent px-[5px] text-[#C5C4C4]"
            onChange={(option) => setSelected(option.target.value)}
            value={selected}
          >
            {optionsMembers.map((option) => (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
          <div
            className={`${
              isLoading
                ? 'animate-pulse bg-[#8e68e829]'
                : 'cursor-pointer  hover:bg-[#8e68e829]'
            }  ml-[20px] flex items-center rounded-[5px]  border-[1px]  border-[#642EE7] p-[2px] px-[10px] text-center text-[14px] text-[#642EE7] `}
            onClick={() => {
              handleInviteMember()
            }}
          >
            Invite member
          </div>
        </div>
      </div>
      <div className="mt-[50px] text-[18px] font-medium">
        <div>Members / {users?.length}</div>
        <div className="mt-[20px] grid gap-y-[25px]">
          {users?.map((workspaceUser, index) => (
            <div
              key={index}
              className="flex items-center gap-x-[10px] text-[15px] font-normal"
            >
              <div
                onMouseEnter={() => setIsUserModalOpen(workspaceUser.id)}
                onMouseLeave={() => setIsUserModalOpen(null)}
                className="relative flex items-center gap-x-[10px]"
              >
                <img
                  alt="ethereum avatar"
                  src={workspaceUser.user.profilePicture}
                  className="w-[35px] rounded-full"
                ></img>
                <div className="w-[50px] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                  {workspaceUser.user.email}
                </div>
                {isUserModalOpen === workspaceUser.id && (
                  <UserWorkspaceInfoModal userWorkspace={workspaceUser} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceMembers
