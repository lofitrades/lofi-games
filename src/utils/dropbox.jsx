// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFgFmofF3KAN0opOUTACdTE2lS-yffnuAX3C-t2u35zn3krvnRUrT1TeQiApyvGtPlzp4HeS-3kUczagSBClHaAys0kcrUXd2OZRXPLG79XHb0j1B7CXG7yNnc5kCpbJUn5Z-6-0wP0V3ltYa9zJipN5iYNCeuy34K2U1VR7GzRhfuvfXnSrso_I3OUDAZoM5tjBeArreugAMXxQaVLPitVbCGH9XvNa0_Yr72T0gw_7z43rFUd9DXoaFZ5uAKXQmHRpPKLAQu-XKcpQJ3xBCGRj4Ha21slLa0pRRXmWpCTFOdJg_xs_joWPPA6MV5JuxiFE-y_avcRWK0ySyij3Mjs2RpT81KtqW-h68RUxsiNOiimcqhk5ACcKUtyGywAJlJDU_naE4xhHMTMUwp0NGTAPHAcInIB6yWZrhRLdxT-vHm3U794IKNPb4w8vihVHwLecQrGRdn6k-qbWBc-L9sLK33LXYVeja2KZLi_uB6zI0QPbELT2gSlA6TX8FJvHOBG1CftB8_1Up9mm4jcyREWOKRIFISe27_XMIwxuOk9wJIQgZhyBObuipisEwed05OtwNcyBNMkVLcpq9vxAwLuE_rf_3PG2GFzH2yeN--GSxHZYsv5vCvh9zUtoJbtVSRtNea1Maw68y-v3Bo0btxBoRWCbfhWjrFefKWOwONkYDjijoq6klqO5RFVnqmRP29nMGgYQWeszkNZJ_MI1h_k64OKb9SZuWdlDkepo9SnXntfdx7lHdHd1QzXAhY8x-SmrPgQIortBos4YPUwGJzE-AgAQ2QHjBQtT9iANb7AeOizzcbTXIJ5V5mf4khCsPlW9G-z1xpKlQJ_T4Y2U21SsFH_s5U_FIsdlntzbkM4hSf_zl4Odf-QOWzty8eyMl04aMzAZth10C3qfsK0ZOtoSQMmmGuHpdeOrhhxtBWPPsFn4JmjhPeOq66ZFh9nvErtX28PZD3C6sL_2sHzTRAsnFaTFlcbMdAH8TfUuaCLwemfTguwp20ndRDhz8ATTZMS5l-cKtR6ciYeWzmMtqsNSse-sgQBsn0IwWI22dJKTcLz7aTokVjbUVli-SVfnUCl7IrlG-D_wUP2M3SuscaYbS6Xkcf7ArYPhyGb0KzAo3u8Gegp7_lIurB-L6h8bXSmF8I67VY5XLxj3IvwSNq1elUqFQQ73GGeD130gTPftk5srs72SwxW59csCdNWcEdyUe3n-D6ZxyAn6TjTLM6sKM2VkDc28AyIwGNQNYcgK1BqfzBoQ2ZOhdZJREP6ilvBMQ7rEo2eYmEg9tY2PWawloIcVQFh0uS84PghpZrlXusNMnFfsLE8vzoyBE8CCJQ2Yc_ImO34X_GZiHRsgHfWumBUKDQPndRLluQsCn_LIC69TFnPyGuSPH1yJiY__QILgoG_bHa3nVO-_NU_dVxuShiIHdVSVmp59mbcLmnjpAA";
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
