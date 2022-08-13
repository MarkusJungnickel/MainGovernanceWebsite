import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { RecordContextProvider } from "react-admin";

// <Box
// sx={{
//   width: 200,
//   flexDirection: "column",
//   borderColor: "black",
//   border: 1,
//   boxShadow: 1,
//   mt: 10,
//   ml: 1,
//   position: "absolute",
// }}
// >

export default function Roles(props: any) {
  return (
    <Grid container spacing={2}>
      {props.NFTData.map((record: any) => (
        <RecordContextProvider key={record.opensea} value={record}>
          <Grid item>
            <Box
              sx={{
                border: 1,
                height: 200,
              }}
            >
              <a href={record.opensea} target="_blank" rel="noreferrer">
                <img
                  src={record.properties.image.description}
                  style={{
                    justifySelf: "center",

                    height: 170,
                    width: 190,
                    overflow: "hidden",
                  }}
                />
              </a>
              <Typography fontWeight="bold">{record.title}</Typography>
            </Box>
          </Grid>
        </RecordContextProvider>
      ))}
    </Grid>
  );
}

// <Grid item xs={12} md={4} lg={3}>
//       <Box
//         sx={{
//           width: 300,
//           flexDirection: "column",
//           borderColor: "black",
//           border: 1,
//           boxShadow: 1,
//         }}
//       >
//         <Typography variant="subtitle2">Roles</Typography>
//         <figure>
//           <a href="https://google.com" target="_blank" rel="noreferrer">
//             <img
//               src="https://arweave.net/u27xWJJHq5XmQJtZcJ_8H7SHeebBV47W_oKcapu6wvA"
//               style={{
//                 marginTop: 30,
//                 width: 200,
//                 height: 200,
//                 borderRadius: "10%",
//                 overflow: "hidden",
//                 borderWidth: 3,
//                 borderColor: "black",
//               }}
//             />
//           </a>
//           <figcaption>Executive</figcaption>
//         </figure>

//         <figure>
//           <a href="https://google.com" target="_blank" rel="noreferrer">
//             <img
//               src="https://arweave.net/u27xWJJHq5XmQJtZcJ_8H7SHeebBV47W_oKcapu6wvA"
//               style={{
//                 width: 200,
//                 height: 200,
//                 borderRadius: "10%",
//                 overflow: "hidden",
//                 borderWidth: 3,
//                 borderColor: "black",
//               }}
//             />
//           </a>
//           <figcaption>Executive</figcaption>
//         </figure>
//       </Box>
//     </Grid>
