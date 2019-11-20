module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: '@wardpeet/gatsby-plugin-sharp-worker',
      options: {
        inputPaths: ['./src/images/mountains.jpg'],
        digest: '1234',
      }
    },
    {
      resolve: '@wardpeet/gatsby-plugin-remote-file',
      options: {
        url: 'https://images.unsplash.com/photo-1568794065652-b9642d4be0ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        ouputFilename: 'forest.jpg',
      }
    },
    {
      resolve: '@wardpeet/gatsby-plugin-sqip-worker',
      options: {
        inputPaths: ['./src/images/mountains.jpg'],
      }
    },
//     {
//       resolve: '@wardpeet/gatsby-plugin-structured-logging-worker',
//       options: {}
//     }
  ],
}
