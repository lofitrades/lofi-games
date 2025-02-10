// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFid_HjteRZ68xXkO9VCUrMxLhBZgYdcH0WWw0GEfUqL-xW9Y-HhzT3AEbqK78R1psTWtxP4F3B385l-BVhmjnq_eLKJNVGrGMHM1xP70QqXT868M-_Ad91MGOCSkizVai9sHWy3uyDCMRGanU2RYtCUQ-UMJuz762zgnfegzTCHwyGmYcSwt-W5k22cSYoItKbnr0ZuQskC4cRP5LTThVw-9_iILudBWASWRzz7SAso3MhaZUuCOPTbPv_Ic68g5JvDJ_t1rdpNKDQkSKIsC_L99kTIGA2A-hCSC79NAsNurtCVhOutlizxMJiwl4qxQvqF6Od8DV4wk5B4MfBnoHNbArrCXO1OhL8v3dScD1_ut7cwSsw_yl4Xr5GoR6gAm6iMndXE0krWW7ge9Xi4H-t-GtA3E4y_yoeeCyHtAkQEoVZXwN715hoPcN2wIPZZC3aaHrCdqB05Mn8mdCyxuLnVudxBRqh0Hy6lbAr1mZdCKGyKE5UOsWEiO62hwmL8y5U0o5rWMcLiY0pguRbmhWzB5Ui8TIrSC_tEuSLQaDi9CgumnkVWWUn-ryU3ydQNiOeQErFwWqVgi6XHn46JkfO8BaOtTAh9CKnl8h8I1PKMnNUlmCy3J9tm843SwR8-xw-8kiI6mUtF2Z0mQcQmzjp9Tk6CFH86dGn396OK681LChEB8B4JnVJqTr1tjfLm4nzosD9s0uGid8KYy12jwrFkGV3OdWOTgdPHYkxtjtD6jt9tpqDbDd3Fl5CqIOgYXxricFCkojLj3POgG_gEhReh5IT5MPOUijWiq2DSoZmQe_WE6Ed-jeK-aKC7iaqtSRQXulsV_CyA9B-44J1ULK0zcoPbDcPJxisAMagzzX6vxU7QuJZKM_PkCqUWol0_yFFS2tzlBYP-T8LSPZv10fHRwjDb0enUwjw2TWc8CqJfSBgyvrvQ3hPzK3Uz_jNLIbRKsWDSCTDhHwzWHfQaYwpJMSGiuY-9kyW24pXfj9CW2S2AQGhVyUTqAK14fPYQayZOY40d4YtaCcn9vF5zGj7N91_2cRfkIG8sWCDVvdKjnMeowN-HPYmxOqxAQ63taqH5nqcFdTIvgg1iHZOiEZrDPRHT8QrVMidbQBo0UMKAQB35QbBJPouDaASWFxDmfJbt-5AaNR4mNT0CDq_P233EORxf076wL9dr6KgeZRhMpGFheMq5Z0GyXffA0Jz61DTUmx0ekHUKgVTXBrJOI-6aCv1B7M_s79R-x9ewXzovRL-COl9F_WKE9a3GAjdqruHyvmPgXdldhCcEaLfsMlUCFhtziuDSEi7HrLxJWyh8zwKrE2UQJ25jLXrXI6I1imzaePHXPoc_OxDBq8d9eD5w6761M8KJ_dYBLILLrBMqzzWvlSovursLqkrTtZPl3CGVxArwrNx4ZFeFtX5cA14lAgF8AiVrB5KCivZFK_sLqQ";
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
