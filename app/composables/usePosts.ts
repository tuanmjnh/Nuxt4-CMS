export const usePosts = () => {
  const { token } = useAuth()

  const fetchPosts = async (params: Models.PostQueryParams = {}) => {
    return await $fetch<Models.ListResponse<Models.Post>>('/api/posts', {
      params,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  const fetchPost = async (id: string) => {
    return await $fetch<Models.Response<{ post: Models.Post }>>(`/api/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  const createPost = async (data: Models.CreatePost) => {
    return await $fetch<Models.Response<{ post: Models.Post }>>('/api/posts', {
      method: 'POST',
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  const updatePost = async (id: string, data: Models.UpdatePost) => {
    return await $fetch<Models.Response<{ post: Models.Post }>>(`/api/posts/${id}`, {
      method: 'PUT',
      body: data,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  const deletePost = async (id: string) => {
    return await $fetch<Models.Response<{ id: string }>>(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  return {
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost
  }
}
