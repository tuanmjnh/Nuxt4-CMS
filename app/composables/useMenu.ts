export const useMenu = () => {
  const { token } = useAuth()

  const fetchMenus = async () => {
    return await $fetch<Models.Response<Models.Menu[]>>('/api/menus', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const fetchMenu = async (id: string) => {
    return await $fetch<Models.Response<Models.MenuWithItems>>(`/api/menus/${id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const fetchMenuByPosition = async (position: string) => {
    return await $fetch<Models.Response<Models.MenuWithItems>>(`/api/menus/position/${position}`)
  }

  const createMenu = async (data: Models.CreateMenu) => {
    return await $fetch<Models.Response<Models.Menu>>('/api/menus', {
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const updateMenu = async (id: string, data: Models.UpdateMenu) => {
    return await $fetch<Models.Response<Models.Menu>>(`/api/menus/${id}`, {
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const deleteMenu = async (id: string) => {
    return await $fetch<Models.Response<{ id: string }>>(`/api/menus/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const createMenuItem = async (menuId: string, data: Models.CreateMenuItem) => {
    return await $fetch<Models.Response<Models.MenuItem>>(`/api/menus/${menuId}/items`, {
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const updateMenuItem = async (menuId: string, itemId: string, data: Models.UpdateMenuItem) => {
    return await $fetch<Models.Response<Models.MenuItem>>(`/api/menus/${menuId}/items/${itemId}`, {
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const deleteMenuItem = async (menuId: string, itemId: string) => {
    return await $fetch<Models.Response<{ id: string }>>(`/api/menus/${menuId}/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  const reorderMenuItems = async (menuId: string, items: Array<{ _id: string; sortOrder: number }>) => {
    return await $fetch<Models.Response<Models.MenuItem[]>>(`/api/menus/${menuId}/items/reorder`, {
      method: 'POST',
      body: { items },
      headers: { Authorization: `Bearer ${token.value}` }
    })
  }

  return {
    fetchMenus,
    fetchMenu,
    fetchMenuByPosition,
    createMenu,
    updateMenu,
    deleteMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderMenuItems
  }
}
