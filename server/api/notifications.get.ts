export default defineEventHandler(() => {
  return [
    {
      id: 1,
      unread: true,
      sender: {
        name: 'Alice Smith',
        avatar: {
          src: 'https://i.pravatar.cc/150?u=1',
          alt: 'Alice Smith'
        }
      },
      body: 'Sent you a project invitation',
      date: new Date().toISOString()
    },
    {
      id: 2,
      unread: false,
      sender: {
        name: 'Bob Jones',
        avatar: {
          src: 'https://i.pravatar.cc/150?u=2',
          alt: 'Bob Jones'
        }
      },
      body: 'Commented on your post',
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      unread: true,
      sender: {
        name: 'Charlie Brown',
        avatar: {
          src: 'https://i.pravatar.cc/150?u=3',
          alt: 'Charlie Brown'
        }
      },
      body: 'Mentioned you in a comment',
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ]
})
