import FacebookProvider from 'next-auth/providers/facebook'

export const authOptions = {
  //   providers: [
  //     FacebookProvider({
  //       clientId: process.env.FACEBOOK_CLIENT_ID,
  //       clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  //     })
  //     // Add other providers if needed
  //   ],
  pages: {
    signIn: '/user/signin' // Custom sign-in page if needed
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id
        token.email = profile.email
      }
      return token
    }
  }
}
