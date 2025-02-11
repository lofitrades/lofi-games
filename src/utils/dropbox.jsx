// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFhrydij3ssM_KRfnSfEJmPLMnflsTqr0kBWt8k955wxMsWpMtVLcu4Ghc5QwpBScNfpMJOU86ulyGThES-i4FwJkv0-gvVtFXhvC-7Viprn-qj9nHK6FOj-fwqMdYStOuizivWFhy-cu4JR4NFE9r6fEFU5DoOP6ACxyfvDtSIJiXrtIg9UJCkJzCsJmwqbn5BTZPlj30GTtBSXFaO4MESt4eAoW6jGHLBeH122hW3xZrXbOyiilBG3ofkDbdhpc1ASKS4uVQXN6O6oeZXWiaicYQPsgOy7g2ghZpvnbe70hJWkSf_4EhAwuSOlfrinJEVUga3HF3JfhbMn0qWgHKaZya_HuBTd6OohFh7ucvKrz_cWlohljyWyFXkjsipMzHvt9V4JlJLciTrRdd8q2DMMV9tj4LYhtaxbcFjQOqSbCG3GZJHFW9qg6K5mv9mo7yvRkYSFXic6mK0RFAc0vYo_BOKXxUPMxtcDmtFwEh8rm8UkC5uVGln9RgExlCjw13F8ikEHedoVxeCxmyK0-jn7rOTJW1Bw5OnkMApJh0qVWpBmBwn2VhVM_lZy0ZCKrk4fUYGxeZpQQSTVbG4azpQyNzbry_kQ1AqOWf1g_APYdfP91gAXoEqY9yRAaL9z-xSfotE9pCzqkMGeSmdfk0O3ETzO5jp_x36iJfrx8YdYhUPLmZgsaCAShhZYLx32JVQquyEQq4NqSySqAKDqTu5G0DN8MzPhlbhLkLvTGP4GzV5VPTkPwBxxZutGujYynC_dVKLSTybDbnGe4qOCi74fyYz3COVLRogYkxJMWgaGWaG-5ObUxQZEGhSkWar6plTWDeV1mrrt5p1Ws1pq0A9gWM38dxRIPMs_eqvYY5I0sY3s1NlvReOrKelM7k5x5Eab1BFAquEjU-r1PEmX-WKRqsu5YxYO5xe9-SwvkPEyTPbjMlkIWM2Kl5N3m_pytH0vAdWGDk3iAJRE8BKngXKhuBUVaC_K-Y1wCopnJLaNV3s7VrsdmqOr1sAMvh033Vnx788aj7aEwSw2jQHV1neMmj1GOyYGEZEZlQcp2UjqZi2eeb8nqoI8_22wTBncIbX7mKlCdXlyyJ3_MclrksFujuzy6b8w0gBAOsgrVeHsHKx86pUd8VG9Bn9E0KdlVGvpk27Br92fQMYkGLxz7tl7VDsf6PH6oiu-5vIpQbCUX_oeyn57W1VGpTAIz1nrs3-3RCkQD1suwXA093Nu5BW6mf4G5D4TE5Ni_HhlNt7aW3TLHTb74An0dBpmANgUGPOd7fBCgCeNeo8EkYu3Kvg7iomZ3QyuoZ1RTZ_zxQmHFcbgAQ6pbnbG1DB3OHqi49VFFMdGzwbxzkzjwOG3dTo00SFfAQTIDd2gfffOZ461C7VZfQBtvulHbN01UvOIahKUh9-quIGhwa0GdyyS6vn_Y7Nhct6DNOJY4aTh-6_diQ";
  const folderPath = "/lofi"; // Root folder for lofi
  const songsFolderPath = `${folderPath}/songs`;  // Songs are stored in /lofi/songs
  const imagesFolderPath = `${folderPath}/images`;  // Images are stored in /lofi/images

  try {
    const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: songsFolderPath }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dropbox API Error:", errorText);
      throw new Error(errorText);
    }

    const data = await response.json();

    const songs = await Promise.all(
      data.entries
        .filter(file => file[".tag"] === "file" && file.name.endsWith(".mp3"))
        .map(async (file) => {
          const tempLink = await getDownloadLink(file.path_lower, ACCESS_TOKEN);
          const songNameWithoutExtension = file.name.replace(/\.mp3$/i, "");
          const imageFilePath = `${imagesFolderPath}/${songNameWithoutExtension}.png`;
          const imageLink = await getDownloadLink(imageFilePath, ACCESS_TOKEN);

          return {
            name: file.name,
            url: tempLink,
            imageUrl: imageLink,
          };
        })
    );

    return songs.filter(song => song.url !== null);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

// Function to get a download link for any file (song or image)
export async function getDownloadLink(path, ACCESS_TOKEN) {
  try {
    const response = await fetch("https://api.dropboxapi.com/2/files/get_temporary_link", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to get temporary link for:", path, errorText);
      return null;
    }

    const data = await response.json();
    return data.link;
  } catch (error) {
    console.error("Error in getDownloadLink:", error);
    return null;
  }
}

// Function to fetch image link specifically (you can use this in MusicPlayer)
export async function getDropboxImage(imagePath) {
  const ACCESS_TOKEN = "sl.CF-UPHtYvHpDWByampybHWKIWy2u8vqIXySf24D-HPOBnUrInJx3uXFC29a7S_Uz9g2pWagIvEpH3CyXiPDZ462pubOXa7e-6S5XMv66NwE1LCneCrLkrGT5sJXKb7ODxgMyqoixy3GC"; // Ensure your access token is up to date

  try {
    const response = await fetch("https://api.dropboxapi.com/2/files/get_temporary_link", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: imagePath }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching image link:", errorText);
      return null;
    }

    const data = await response.json();
    return data.link;
  } catch (error) {
    console.error("Error in getDropboxImage:", error);
    return null;
  }
}
