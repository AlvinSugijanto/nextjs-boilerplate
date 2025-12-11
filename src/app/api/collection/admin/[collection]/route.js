// Next Imports
import { NextResponse } from 'next/server'

import { getAdminClient } from '@/utils/pbAdmin'

function getAccessToken(data) {
  const match = data.match(/accessToken=([^;]+)/)

  return match ? match[1] : null
}

// GET Method
export async function GET(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || `Bearer ${token}`

  const type = req.headers.get('type') || 'getList'
  const page = req.headers.get('page') || 1
  const limit = req.headers.get('perPage') || 5

  const expand = req.headers.get('expand') || ''
  const sort = req.headers.get('sort') || '-created'
  const filter = req.headers.get('filter') || ''
  const fields = req.headers.get('fields') ?? ''

  try {
    const pbAdmin = await getAdminClient()

    if (type.toLowerCase() === 'getlist') {
      const record = await pbAdmin.collection(collection).getList(page, limit, {
        expand,
        filter,
        sort,
        fields
      })

      return NextResponse.json(record)
    } else if (type.toLowerCase() === 'getfulllist') {
      const record = await pbAdmin.collection(collection).getFullList({
        expand,
        filter,
        sort,
        fields
      })

      return NextResponse.json(record)
    }

    return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(error.response, { status: error?.status || 500 })
  }
}

// POST Method
export async function POST(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || token

  const contentType = req.headers.get('content-type')

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()

    const data = {}

    // Create a Map to handle array fields
    const arrayFields = new Map()

    for (const entry of formData.entries()) {
      const [key, value] = entry

      // Check if the key ends with '[]' to handle array fields
      if (key.endsWith('[]')) {
        const arrayKey = key.slice(0, -2)

        if (!arrayFields.has(arrayKey)) {
          arrayFields.set(arrayKey, [])
        }

        arrayFields.get(arrayKey).push(value)
      } else {
        data[key] = value
      }
    }

    // Add array fields to data
    for (const [key, values] of arrayFields) {
      data[key] = values
    }

    try {
      const pbAdmin = await getAdminClient()

      const record = await pbAdmin.collection(collection).create(data)

      return NextResponse.json(record)
    } catch (error) {
      console.log({ error })

      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  } else {
    const data = await req.json()

    try {
      const pbAdmin = await getAdminClient()

      const record = await pbAdmin.collection(collection).create(data)

      return NextResponse.json(record)
    } catch (error) {
      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  }
}
