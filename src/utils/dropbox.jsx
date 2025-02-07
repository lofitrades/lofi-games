// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFh9rdwi_v3FBevJiqxuwFziZ2JfanAQCExchb3mJXodO9pUqvs1GF-FIVWixlxMoxUGdqtYwTTHbv0oQFmjS0uSNtwar2qzEtvsS7Cn2pE6OoKUC3Vts59SEtrHEznc2PrlFtceggB3N30P0D_lXMhfgUwW3MvfcGqapjA8VF8TDa905ejLD2-Z2L9i0C_1KgcWKwNH_vYz7d3H9Sqm2CzPpc3Mhuz5SkZxkeXqJYU8ZpgYzpF6I58yG5qoSSMHRsmwJZH1eKD9XkXbAaQMVcMncCLSGio9d4xv-QLEdnztLJ0-DZpHR6Klj58WIkcZ3hAVmTRu_YgxC9l1OmDYV5LDYPuKQ42CrCl0MgnaTfVIGz5-pUTWG3jigUjfOnmnhlhGwkUOZmW63A3bW_GPoaeTm3Q044JQ7ZQg4WxR9anN9Kf-YV26gZEIoeqkTbLTgtxtwnP4xSnbre54Oy1jcQCu-xQdwEe8e6JVvIYzc5pg-Z7bzs4Bv9oF78z-C_6-yY7TPoYE8Jf0PiNugyN8BVfbHZ9zpuTNwmF3tT8myKZW6ZXQaNGetl2LYPV2V9Iq35lejnFsTNRxb5z2MCQKMfSbK7NCicU9pSPAswEb_ngO9pXRRCszSWeZq1CjqtYMYXLg5yb9iuqyLKBS73vJvhGEYFq6bcaaAqXygTQ8B5W5QKhtVTLezxl76VJjSRYAWpEw3ialIDUVz46e4O-WlmTg4RkSKxy4XYG8nEWE3myrRBHE8rP25cnEAYc5gE3MLLlGwSm7wQatv3h9G1S3uRBesyOJcbbGuJ53zOD5jOOjsOLEHDjm46Pzt2jquEo78XsnYt5yUE4V682gxqHC_LRRCNakb2Yn_oUXGc0si7OkIrpxozYVTpAfJp9WvxJVtuvF87i8phL6mHk0taZ14I8f5xDP4gRbkf3KWB7-cOElqaQewZWD4WEhJUs7oa-bMrIeLxXb_lDsN2_VqemAjnIoBalS4_qRiVR6cLF_egZpos2KTnmlrv7z_PyXc4OSIUnzw4PrIebw5xpaKh4PgFBrGRGTrLqorE_8tlX_fgLZhofMAOJ7_v-VtOT8bSRTMb-jGJryFIQxrlMyDx77B2HZsSBGGxjP9bw64VRHYtWxPJ3IwXePa_cBiN6t5yOv_oShL1vhH7-7V-NWMNE--XgYkSF474yiNrkfoIkiUbWHHnxLYM15jbwV3ZGCcQFvfM7pozthbW-jYng4j1BgNYUCR5Wh55QYjDiPdKVsnSTc-qDM6VgVQRIhykPCwH-P8jQ9zds-XoPfJWi0v-DQpnCt3cw604OMCjWPjNcDsGCvLla_BQnn3_E7SeERhejPTEEiwr-sG3ZvMv1OPAQIxIzyBvn9_kdVxpUILjpyB5bZZ6R2AMlOT8kVjGF-of4bCspfKOMlYr0aFLQo3MIv88A3anxy5jdnb7ozR6tqLohORA";
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
