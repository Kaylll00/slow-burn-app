import { supabase } from './supabase'

export const uploadImage = async (url, userId, wantId) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const fileName = `${userId}/${wantId}-${Date.now()}.jpg`

    const { data, error } = await supabase.storage
        .from('want-images')
        .upload(fileName, blob, {contenttype: 'image/jpeg'})

    if (error) throw error

    const { data: publicUrl} = supabase.storage.from ('want-images').getPublicUrl(fileName)

    return publicUrl.publicUrl
}