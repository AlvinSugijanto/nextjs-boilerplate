// Next Imports
import { NextResponse } from 'next/server'

import { getAdminClient } from '@/utils/pbAdmin'

function getAccessToken(data) {
  const match = data.match(/accessToken=([^;]+)/)

  return match ? match[1] : null
}

// METHOD GET
export async function GET(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || `Bearer ${token}`
  const expand = req.headers.get('expand') || ''

  try {
    const pbAdmin = await getAdminClient()

    const record = await pbAdmin.collection(collection).getOne(params.id, {
      expand
    })

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(error.response, { status: error?.status || 500 })
  }
}

// METHOD PUT
export async function PUT(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || `Bearer ${token}`
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

      const record = await pbAdmin.collection(collection).update(params.id, data)

      return NextResponse.json(record)
    } catch (error) {
      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  } else {
    const data = await req.json()

    try {
      const pbAdmin = await getAdminClient()

      const record = await pbAdmin.collection(collection).update(params.id, data)

      return NextResponse.json(record)
    } catch (error) {
      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  }
}

// METHOD PATCH
export async function PATCH(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || `Bearer ${token}`
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

      const record = await pbAdmin.collection(collection).update(params.id, data)

      return NextResponse.json(record)
    } catch (error) {
      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  } else {
    const data = await req.json()

    try {
      const pbAdmin = await getAdminClient()

      const record = await pbAdmin.collection(collection).update(params.id, data)

      return NextResponse.json(record)
    } catch (error) {
      return NextResponse.json(error.response, { status: error?.status || 500 })
    }
  }
}

// METHOD DELETE
export async function DELETE(req, { params }) {
  const collection = params.collection

  const cookie = req.headers.get('cookie')
  const token = getAccessToken(cookie)

  const authorization = req.headers.get('authorization') || `Bearer ${token}`

  try {
    const pbAdmin = await getAdminClient()

    const record = await pbAdmin.collection(collection).delete(params.id)

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(error.response, { status: error?.status || 500 })
  }
}
