import {
	DownloadIcon,
	PencilIcon,
	RefreshIcon,
	UploadIcon,
} from "@heroicons/react/outline"
import axios from "axios"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Button } from "../../components/Button"
import { Field } from "../../components/Field"
import Header from "../../components/Header"
import { Layout } from "../../components/Layout"
import SpellCard from "../../components/SpellCard"
import { useAppDispatch, useAppSelector } from "../../store"
import { setErrorMessage } from "../../store/reducers/settings"
import { load, rename } from "../../store/reducers/spellbook"
import { Spellbook } from "../../types/Spellbook"

const FETCH_SPELLBOOK_QUERY = "fetchSpellbook"

export default function SpellbookDetail() {
	const queryClient = useQueryClient()

	const spells = useAppSelector((state) => state.spells)
	const spellbook = useAppSelector((state) => state.spellbook)
	const dispatch = useAppDispatch()

	const [isEdit, setIsEdit] = useState(false)
	const [overwriteLocalData, setOverwriteLocalData] = useState(false)

	const [title, setTitle] = useState(spellbook.title)

	const router = useRouter()
	const { id: spellbookId } = router.query

	const fetchSpellbook = async () => {
		const res = await axios.get(`/api/spellbooks/${spellbookId}`)
		const data = res.data as Spellbook
		return data
	}

	const updateSpellbook = async (updatedSpellbook) => {
		return axios.put(`/api/spellbooks/${spellbookId}`, updatedSpellbook)
	}

	const fetchSpellbookQuery = useQuery(
		FETCH_SPELLBOOK_QUERY,
		fetchSpellbook,
		{
			onSuccess: (data) => {
				// if the open spellbook is the same, don't load remote data again
				if (spellbook.id !== data.id || overwriteLocalData) {
					setOverwriteLocalData(false)
					dispatch(load(data))
				}
			},
			onError: () => {
				dispatch(
					setErrorMessage(
						`Couldn't fetch spellbook from API with id ${spellbook.id}`
					)
				)
			},
			enabled: !!spellbookId,
		}
	)

	const updateSpellbookMutation = useMutation(updateSpellbook, {
		onSuccess: () => {
			queryClient.invalidateQueries(FETCH_SPELLBOOK_QUERY)
		},
	})

	const canRename = spellbook.title !== title

	const _handleRename = () => {
		dispatch(rename(title))
		// update title on remote
		updateSpellbookMutation.mutate({ ...spellbook, title } as Spellbook)
		setIsEdit(false)
	}

	const _handleUpload = () => {
		updateSpellbookMutation.mutate({
			...spellbook,
			spellIds: spellbook.spellIds,
		} as Spellbook)
	}

	const _handleDownload = () => {
		setOverwriteLocalData(true)
		queryClient.invalidateQueries(FETCH_SPELLBOOK_QUERY)
	}

	const shouldSync =
		fetchSpellbookQuery.isSuccess &&
		spellbook.spellIds &&
		spellbook.spellIds.toString() !==
			fetchSpellbookQuery.data.spellIds.toString()

	return (
		<Layout>
			<section className="space-y-2 px-2">
				{isEdit ? (
					<>
						<Field
							label="New title"
							id="title"
							type="text"
							value={title}
							onChange={(value) => setTitle(value)}
							placeholder="Spellbook title"
						/>
						<Button
							title="Rename"
							onClick={_handleRename}
							icon={<PencilIcon className="h-6 w-6" />}
							disabled={!canRename}
						/>
						<Button
							title="Cancel"
							onClick={() => setIsEdit(false)}
						/>
					</>
				) : (
					<>
						<h2 className="inline-block py-2 text-2xl font-bold">
							{spellbook.title}
						</h2>
						<a
							onClick={() => setIsEdit(true)}
							className="ml-3 inline-block cursor-pointer text-lg underline"
						>
							Edit
						</a>
					</>
				)}

				{shouldSync ? (
					<>
						<p>
							Your local spellbook is different from the cloud
							one.
						</p>
						<Button
							title="Upload"
							icon={<UploadIcon className="h-6 w-6" />}
							onClick={_handleUpload}
						/>
						<Button
							title="Download"
							icon={<DownloadIcon className="h-6 w-6" />}
							onClick={_handleDownload}
						/>
					</>
				) : (
					<p>Your local spellbook is up to date.</p>
				)}
				{updateSpellbookMutation.isLoading && (
					<p className="font-bold">
						<RefreshIcon className="mr-2 inline-block h-6 w-6 animate-spin" />
						Syncing your spellbook...
					</p>
				)}
				{updateSpellbookMutation.isError && (
					<p className="font-bold text-red-500">
						Couldn't update your spellbook!
					</p>
				)}
				{updateSpellbookMutation.isSuccess && (
					<p className="font-bold text-green-500">
						Your spellbook has been updated!
					</p>
				)}
				<p>
					<Link href="/">
						<a className="inline-block py-2 underline">
							Add more spells
						</a>
					</Link>
				</p>
			</section>
			<section className="grid list-none grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
				{spells &&
					spellbook.spellIds &&
					spells
						.filter((a) => spellbook.spellIds.indexOf(a.id) >= 0)
						.map((spell) => (
							<SpellCard
								spell={spell}
								key={spell.id}
								selected={
									spellbook.spellIds.indexOf(spell.id) > -1
								}
							/>
						))}
			</section>
		</Layout>
	)
}