export { }
declare global {
  namespace Models {
    export interface Connect {
      _id?: string
      key?: string
      code?: string
      title: string
      clientID?: any
      credentials?: any
      authUri?: string
      redirectUris?: string[]
      profile: any
      config?: any
      sort: number
      flag: number
      created?: Common.IChangeData | null
      updated?: Common.IChangeData | null
    }
  }
}
