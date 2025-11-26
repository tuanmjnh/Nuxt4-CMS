export { }

declare global {
  namespace Models {
    interface Notification {
      id: number
      unread?: boolean
      sender: {
        name: string
        avatar: {
          src: string
          alt: string
        }
      }
      body: string
      date: string
    }
  }
}