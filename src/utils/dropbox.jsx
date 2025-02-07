// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFjhAHFOSj1FCeqx3U8iJUK-rmRuqDTjglgbuGzg5EkPR95nlfEu585Qz3f2DWPNjuQ6Gg4Eythgngx-APHYeHn8N6VwUHpwWez6W--cmC97AT3wMSIa5WekY4VnA3g_naNBGuPpQGxzjqAh95HLCb8zykEdBAbtqzhTA4_ee9SbmVKbUeUyX2S0PP5DR-xJH_rg-SMDqsDDxGv7gMA3nJOoY0jnKYgM1UL1doFkz1E5xRrdqQKRWSgAjnLS0Z-cg0JmrU9iDpwY_baN3_mzyrvmxbL9ETaZhUqVsXLQJ1KYVCUhustLInQRMz4VRx_u-jHc6UCjCDW7YLwgV2nnq_rkgewwbmr2znTxDn3xpGXHqsCtY0lEgcAzz0AfpAHi6OS7-nvgxo86hbwVcPLPJwc4bghZuqOBYy2QBbjrR6LIz0X4KZnaSWdVWLoSkeAG_FwPtVkAADKuoxYkKfThitdYFUc-GqRtzVYXMVZ1afJWgdQjoU4KzFsQr1ppsZTjq2b_fzNm5gqjygzI_H25AXFfXudSTTQ7S3EgjbaSI2PEIUOz3ZsARoz2AeXowu2Zm_0abQgTSoiQasELF1XFOIt1SnMJuh9-0_SLYj29bM3XSdTmAMuwN4X1Q3cSLjw-1dIiho4rol5xNuIo1HkYQwS6GOa-1bd_b944TqSc7NGnNEDBE4Zr2ly0h95VnJnW-iRRYofGPDFRoHi7Ga7NTdvkO8Q1UYn5io4HEpQ-WaJJ4lfh096iv910M-eSDF99J0mBb7KxY_jH6iSEGwopSdv8_HJ_l0fUhFfvuhOfgDv1ew2PQKse0jRRn0_DxF4NG_qj7rsRYyhRtXUpLcyCPmIZTdZYlJEvsyPYPFzmfM-0k1L1kNQiQaPI8p4zfdBlaoN2eIXCEgPC2Cxm64fdks667TZjpKO34dBIEWvx6egEzcSYea0oKmK_2wjvaCAohFCzOJwRW8Mq9ZCQTVLQIKf7tU8ag4nr2XQTpWbyJamQAhnSJvRx70j35qVMrvx0t1H0ZIlGeQCLa80-KozZ1pNlcswFrOZYZ2Ke0q3zhUX5E6po2JXk_rGX55BmebBaVgkoOw4sbBrx5-nyIpWkU_yi5uPo3QwFi3FniRDEDhzqpycXT76pAzzgQY0uTkXMlyBOfmRJhlzmm1GYVI78OCyrYFX9CCP-ifAaHSafCgU6QjWgcyvVmR6npoRGBcBEm96dVBcg32MbdyNmtk9_NbDc0G6C90Q0Rxszsb3XdQQaeQCgPQ4w760oTc3zzzs1Ma1CxZEK60pSebLUaf6gLNajtWuF0jmJYeNr6diieX9YcnOYcOKYCteLaWv1eeC3NtTdtZMUgn8foqqJIfHjYyKnIvEL3SJCA_-WMXXCbMDnmc3u27SprB04ITrniGGULoD8v_h0kxNdbleqjuAm-5EJAn0VNIWGt_PGW6hGgOOL1w";
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
