import React from "react";
import styled from "styled-components";
import moment from "moment";

const RepoCard = ({ repo, className, onDelete }) => {
  let gitProviderIconUrl = "/images/git.png";
  if (repo.url) {
    if (repo.url.includes("github.com")) {
      gitProviderIconUrl = "/images/github.png";
    } else if (repo.url.includes("bitbucket.org")) {
      gitProviderIconUrl = "/images/bitbucket.png";
    } else if (repo.url.includes("gitlab.com")) {
      gitProviderIconUrl = "/images/gitlab.png";
    } else if (repo.url.startsWith("https://githuman.com")) {
      gitProviderIconUrl = "/images/githuman.png";
    }
  }
  return (
    <RepoCardContainer key={repo.name} className={className}>
      <GitProviderIcon src={gitProviderIconUrl} />{" "}
      <RepoLink href={repo.url} target="_blank" rel="noopener noreferrer">
        {repo.name}
      </RepoLink>
      <RepoDescription>{repo.description}</RepoDescription>
      <RepoInfoContainer>
        <Circle />
        <RepoDetails>
          {repo.languages &&
            repo.languages[0] &&
            repo.languages[0].name &&
            repo.languages[0].name}{" "}
          <Icon className="fa fa-star" aria-hidden="true" />{" "}
          {repo.stargazers && repo.stargazers.totalCount}{" "}
          <Icon className="fa fa-code-fork" aria-hidden="true" />{" "}
          {repo.forkCount}
        </RepoDetails>
        <Date>{moment(repo.updatedAt).fromNow()}</Date>
        {onDelete && (
          <DeleteButton onClick={() => onDelete(repo)}>
            <ButtonIcon className="fa fa-trash" /> Remove
          </DeleteButton>
        )}
      </RepoInfoContainer>
    </RepoCardContainer>
  );
};

const RepoCardContainer = styled.div`
  padding: 16px;
  margin-bottom: 16px;

  &.card {
    border: 1px #d1d5da solid;
    width: 362px;
  }

  &.list {
    border-bottom: 1px #d1d5da solid;
  }
`;

const RepoDescription = styled.p`
  font-size: 12px;
  color: #586069;
  margin: 4px 0 10px 0;

  &.list {
    font-size: 14px;
  }
`;

const RepoInfoContainer = styled.div`
  display: flex;
`;

const Circle = styled.div`
  visibility: collapse;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #f1e05a;
  margin-right: 5px;
  top: 2px;
  position: relative;
`;

const RepoLink = styled.a`
  font-weight: 600;
  font-size: 14px;
  color: #0366d6;
  cursor: pointer;

  &.list {
    font-size: 20px;
  }
`;

const RepoDetails = styled.p`
  visibility: collapse;
  color: #586069;
  font-size: 12px;
  &.card {
    margin: 0;
  }
  &.list {
    margin-bottom: 0;
  }
`;

const GitProviderIcon = styled.img`
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
`;

const Icon = styled.i`
  margin-left: 16px;
`;

const Date = styled.p`
  visibility: collapse;
  font-size: 12px;
  color: #586069;
  margin-left: 10px;
  margin-bottom: 0;
  &.card {
    visibility: collapse;
  }
`;

const DeleteButton = styled.a`
  cursor: pointer;
  border-radius: 0.25em;
  color: black;
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

const ButtonIcon = styled.i``;

export default RepoCard;
