// src/utils/dropbox.jsx

export async function getSongs() {
  const ACCESS_TOKEN = "sl.u.AFgPMCNIzSGtxn4o2IeoKBjbRkrcTrMkB6YHo0zmBWSf4soJr7_LOEfZ05DXPI7hO_5UA4EYfpPOEcC5NH9x63LlTSDR1dxbBANRZkHxHfe1X3lZEZHmZkjFV8Uz53I55JMeQaNguBU7cPRg0kgTNfinVCllyxkG8nX-bht9qQm81GRUgChi5aaEm7NstjmoZ6pbf_NO-MtRymJN-vrhDilQfhXSbL5FvUi4WyHYZJ62vMTRyCOuWZBXefnfDDuRXtVuB7GT6HVHLo8tUZXmUrViOBI3Dq3M_JoSSDNBdl9MIi7Z8p27m0ySGhiTmc9T1wlmtZsSs8kufv6atrKQdcOI1BunulCQJy1-kqbCsYSiOtE2gic0IIcnvwGe82FnLV1rjZsGyywqw7X6do1Up79itFyd_YcZcT1ZwnChqXdHoFSh06mnqm3qgz2ClNfp3g4RvJediIadQ__ju0JI37s__E2iS4YzqA4Ko80xTqRxRp_TQ1bmR8YVMxZE8gnjh_hshmbZNneXcAeWcOv6aYx1SaSqwbN4h3I_TZoNBQQXfs6Yu5VmOoJlF4L0CgNtgnYp7U3XBvyVFqXtozeaSbS-9GYx94tufqTMS46yZseSkd5t1PATtBu4DiwJvXSDtJF0Ex6iEC7xQUt-mCoA9UuaEOqorthHlmZS5wVYcM5eOIjLNp50RkGx5opzQ0cBq_s-gp6xC1E9FLiOTVFWOS52CMd-yzlOSrETW0qWEmSWVfWQ8QOcutjsUzEkzZkBx7YD3YknwMVyuPZeV-PD7HXiVSeGvh2V4NRnd5A8r9HVZisx3bd5H6nSMa0ZAa3f-tSAoeJiIq7WBJqxG_UwC8VXkMoObDV0JHUnTgf4Eg5OHe5aMfisdHCUKPM2Mg8F8MYmsFPrAcySW9OEg_KSIH4VKx0v39amg-CyWUILfKm0Z8YWq766rQ2rZnX4ED93ip2qLWvsCbjsThsve5TCeXRCceqlVuKwywZ9_TdejHvV4XGMFQQ2VLvun7myVWbCc_mloml6q78fFLjrmpy84YmLbfuUw4ZZAzo_i-XF3zbPYU9iFulZResLMxe9-O_SQ137p5ZdqZwRPY6pJE3s4EhDfKb93-KqqUDxrI9IhRr2_aRMDwzcRWjgGO7h1lK80AXJEvANKUELPLfGx8U0xI55m6peEg9yTKOHxVkWK6i7DZGQfxlbul7DPVjFvWGHlMQPJGL2MMwzV3-8t8NzM1tr6kjmOd3t7g05MCJH-yftwzySL-Luaa4bv2izi0uCtMvuFcLD5zAFclYjLU6gNrAGGOyICPVTtu_xIabip1RJq49-07cu4tIh5dFYn8sgFdxmI3i8lo6e3TBmozQ7tNlAfvaDzZdNNw83I0--1f8poWHQ94XFQ9jdy6Fu9JE4ZvTAKocY3SrJyMV4USkUdJGf9eoFx1-chSI52qNDhHCWwA";
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
