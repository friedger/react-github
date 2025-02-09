import React, { Component } from "react";
import styled from "styled-components";
import LoadingIndicator from "./LoadingIndicator";
import Profile from "./Profile";
import RepoCard from "./RepoCard";
import { Helmet } from "react-helmet";
import {
  getGithubRepos,
  getRepositories,
  getFollowing,
  isUserSignedIn,
  lookupProfile,
  putFollowing,
  loadUserData
} from "../lib/blockstack";
import { getUserAppFileUrl, UserSession } from "blockstack";
import { Relation } from "./models";

class User extends Component {
  state = {
    repositories: [],
    githubRepositories: [],
    user: {},
    loading: true,
    loadingFollowing: true,
    updating: false,
    isFollowingUser: false,
    invalidUser: false,
    contactable: false
  };
  userSession = new UserSession();

  componentDidMount() {
    this.updateUser(this.props.match.params.user);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.user !== prevProps.match.params.user) {
      this.updateUser(this.props.match.params.user);
    }
  }

  updateUser(username) {
    this.setState({
      loadingFollowing: true,
      loading: true,
      isUserSignedIn: isUserSignedIn(),
      currentUser: loadUserData()
    });
    lookupProfile(username).then(
      user => {
        getUserAppFileUrl(
          `BlockstackUser/${username}`,
          username,
          "https://app.dmail.online"
        ).then(u => {
          this.setState({ contactable: u !== null });
        });
        this.setState({ user, invalidUser: false });
        if (isUserSignedIn()) {
          getFollowing().then(following => {
            const followingUserList = following.filter(
              u => u.username === username
            );
            this.setState({
              loadingFollowing: false,
              isFollowingUser: followingUserList.length > 0
            });
          });
        } else {
          this.setState({
            loadingFollowing: false,
            isFollowingUser: false
          });
        }

        getRepositories(username)
          .then(repositories => {
            if (repositories && repositories.length > 0) {
              this.setState({ repositories });
            } else {
              getGithubRepos(user).then(githubRepositories => {
                if (githubRepositories) {
                  this.setState({ githubRepositories, loading: false });
                } else {
                  this.setState({ loading: false });
                }
              });
            }
            this.setState({ loading: false });
          })
          .catch(e => {
            console.log(e.message);
            this.setState({ loading: false });
          });
      },
      error => {
        console.log({ error, invalid: "invalidUser" });
        this.setState({
          user: {
            name: "Invalid username"
          },
          loadingFollowing: false,
          loading: false,
          invalidUser: true
        });
      }
    );
  }

  followUser() {
    this.setState({ updating: true });
    const { user, currentUser } = this.state;
    const followPublicly = currentUser && currentUser.username;
    getFollowing().then(following => {
      const avatarUrl =
        (user.image && user.image.length > 0 && user.image[0].contentUrl) ||
        "/images/user.png";
      const username = this.props.match.params.user;
      following.push({
        avatarUrl,
        name: user.name,
        username,
        bio: user.description
      });
      if (followPublicly) {
        let relation = new Relation({
          follower: currentUser.username,
          followee: username
        });
        relation.save().then(saved => {
          console.log({ saved });
        });
      }
      putFollowing(following).then(
        this.setState({ updating: false, isFollowingUser: true })
      );
    });
  }

  unfollowUser() {
    this.setState({ updating: true });
    const { currentUser } = this.state;
    getFollowing().then(following => {
      const username = this.props.match.params.user;
      const newList = following.filter(f => f.username !== username);
      Relation.fetchList({ follower: currentUser.username, followee: username })
        .then(relations => {
          console.log({ relations });
          return Promise.all(relations.map(r => r.destroy()));
        })
        .catch(e => {
          console.log(e);
        })
        .then(() =>
          putFollowing(newList).then(
            this.setState({ updating: false, isFollowingUser: false })
          )
        );
    });
  }

  render() {
    const {
      repositories,
      githubRepositories,
      user,
      loading,
      updating,
      loadingFollowing,
      isFollowingUser,
      invalidUser,
      contactable,
      isUserSignedIn
    } = this.state;

    const overviewTitle =
      repositories && repositories.length > 0
        ? "Published Repositories"
        : "Github Repositories";
    var repos =
      repositories && repositories.length > 0
        ? repositories
        : githubRepositories;
    repos =
      repos && repos.length > 0
        ? repos.map((repo, i) => {
            // Only show 6 repos
            if (i < 6) {
              return <RepoCard key={repo.name} repo={repo} className="card" />;
            } else {
              return null;
            }
          })
        : [];

    const avatarUrl =
      (user.image && user.image.length > 0 && user.image[0].contentUrl) ||
      "/images/user.png";
    const userFullName = user.name;
    const username = this.props.match.params.user;
    const location = null;
    const company = null;
    const bio = user.description;
    const organizations = [];
    const title = `${userFullName} | Gitix Profile`;
    const metaDescription = `All the git repositories publised by ${userFullName}`;

    return (
      <ProfileContainer>
        <Helmet>
          <title>{userFullName}</title>
          <link
            rel="canonical"
            href={`https://app.gitix.org/#/u/${username}`}
          />
          <meta name="description" content={metaDescription} />
          <meta name="og:title" content={title} />
          <meta name="og:description" content={metaDescription} />
          <meta name="og:type" content="website" />
          <meta name="og:image" content={avatarUrl} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:creator" content="gitix.org" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={metaDescription} />
        </Helmet>
        <Profile
          avatarUrl={avatarUrl}
          userFullName={userFullName}
          username={username}
          location={location}
          company={company}
          bio={bio}
          organizations={organizations}
          contactable={contactable}
        />

        <div>
          {!loadingFollowing &&
            !isFollowingUser &&
            !invalidUser &&
            isUserSignedIn && (
              <FollowButton onClick={() => this.followUser()}>
                <ButtonIcon className="fa fa-user" /> Follow
              </FollowButton>
            )}
          {!loadingFollowing &&
            isFollowingUser &&
            !invalidUser &&
            isUserSignedIn && (
              <UnfollowButton onClick={() => this.unfollowUser()}>
                <ButtonIcon className="fa fa-user" /> Unfollow
              </UnfollowButton>
            )}
          {(loading || updating) && <LoadingIndicator />}
          {!loading && !invalidUser && (
            <InformationContainer>
              <div>
                {repos.length > 0 && (
                  <OverviewTitle>{overviewTitle}</OverviewTitle>
                )}
                {repos.length === 0 && (
                  <OverviewTitle>No repositories published yet</OverviewTitle>
                )}
                <RepoContainer>{repos}</RepoContainer>
              </div>
            </InformationContainer>
          )}
        </div>
      </ProfileContainer>
    );
  }
}

const FollowButton = styled.a`
  cursor: pointer;
  border-radius: 0.25em;
  color: white;
  background-color: #28a745;
  background-image: linear-gradient(-180deg, #34d058, #28a745 90%);
  font-size: 12px;
  line-height: 20px;
  padding: 3px 10px;
  background-position: -1px -1px;
  background-repeat: repeat-x;
  background-size: 110% 110%;
  border: 1px solid rgba(27, 31, 35, 0.2);
  display: inline-block;
  font-weight: 600;
  position: relative;
  vertical-align: middle;
  white-space: nowrap;
  text-decoration: none;
  box-sizing: border-box;
  margin: 8px 0px;
  &:hover: {
    text-decoration: none;
  }
`;

const UnfollowButton = styled.a`
  cursor: pointer;
  border-radius: 0.25em;
  color: black;
  background-color: #eff3f6;
  background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
  font-size: 12px;
  line-height: 20px;
  padding: 3px 10px;
  background-position: -1px -1px;
  background-repeat: repeat-x;
  background-size: 110% 110%;
  border: 1px solid rgba(27, 31, 35, 0.2);
  display: inline-block;
  font-weight: 600;
  position: relative;
  vertical-align: middle;
  white-space: nowrap;
  text-decoration: none;
  box-sizing: border-box;
  margin: 8px 0px;
  &:hover: {
    text-decoration: none;
  }
`;

const RepoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const OverviewTitle = styled.p`
  color: #24292e;
  font-size: 16px;
  margin-bottom: 8px;
`;

const ProfileContainer = styled.section`
  max-width: 1012px;
  margin: 0 auto;
  display: block;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const InformationContainer = styled.section`
  margin-top: 24px;
`;

const ButtonIcon = styled.i``;

export default User;
