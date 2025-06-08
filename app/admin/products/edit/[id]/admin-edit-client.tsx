"use client"

import React from 'react'

interface AdminEditClientProps {
  id: string
}

const AdminEditClient: React.FC<AdminEditClientProps> = ({ id }) => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <p>Admin edit product page - authentication required</p>
      <p>Editing product with ID: {id}</p>
    </div>
  )
}

export default AdminEditClient
