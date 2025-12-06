export { }
declare global {
  namespace Models {
    export interface Company {
      _id: string
      name: { en: string; vi: string } | string
      shortName?: { en: string; vi: string } | string
      slogan?: { en: string; vi: string } | string
      desc?: { en: string; vi: string } | string
      address?: { en: string; vi: string } | string
      phone?: string
      fax?: string
      email?: string
      website?: string
      hotline?: string
      taxCode?: string
      logo?: Common.IFileAttach
      banner?: Common.IFileAttach
      gallery?: Common.IFileAttach[]
      mapEmbed?: string
      social?: Common.ISocialData
      openingHours?: { en: string; vi: string } | string
      bankAccounts?: {
        bankName: string,
        number: string,
        owner: string,
        qrCode?: Common.IFileAttach
      }[]
      seo?: Common.ISeoData
      created?: any
      updated?: any
    }
  }
}
