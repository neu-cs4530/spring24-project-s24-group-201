import gql from 'graphql-tag';
import {
  TownCreateRequest,
  TownJoinRequest,
  TownDeleteRequest,
  TownUpdateRequest,
  TownCreateResponse,
  TownListResponse,
  TownJoinResponse,
} from '../classes/TownsServiceClient';
import client from './client';

/**
 * Envelope that wraps any response from the server
 */
export interface AddFriendRequest {
  playerTo: string;
  playerFrom: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface AcceptFriendRequest {
  playerTo: string;
  playerFrom: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface UpdateUserRequest {
  id: string;
}

export interface TownUpdateResponse {
  isOK: boolean;
  message: string;
}

export interface TownDeleteResponse {
  isOK: boolean;
  message: string;
}

const findAllUsers = gql`
  query findAllUsers {
    users {
      player
      email
    }
  }
`;

const townList = gql`
  query townList {
    townList {
      isOK
      response {
        towns {
          friendlyName
          coveyTownID
          currentOccupancy
          maximumOccupancy
        }
      }
    }
  }
`;

const findAllUsersByplayerQuery = gql`
  query findAllUsersByplayer($player: String!) {
    searchUserByplayer(player: $player) {
      id
      player
      email
    }
  }
`;

const searchUserByplayerQuery = gql`
  query searchUserByplayer($player: String!) {
    searchUserByplayer(player: $player) {
      id
      player
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

const searchUserByEmailQuery = gql`
  query searchUserByEmail($email: String!) {
    searchUserByEmail(email: $email) {
      id
      player
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

const searchUserByNameQuery = gql`
  query searchUserByName($player: String!) {
    searchUserByName(player: $player) {
      id
      player
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

const createTownMutation = gql`
  mutation townCreate($input: townCreateRequestInput!) {
    townCreateRequest(input: $input) {
      isOK
      response {
        coveyTownID
        coveyTownPassword
      }
      message
    }
  }
`;

const joinTownMutation = gql`
  mutation joinTown($input: townJoinRequestInput!) {
    townJoinRequest(input: $input) {
      isOK
      response {
        coveyUserID
        coveySessionToken
        providerVideoToken
        currentPlayers {
          _id
          _player
          location {
            x
            y
            rotation
            moving
          }
        }
        friendlyName
        isPubliclyListed
      }
      message
    }
  }
`;

const deleteTownMutation = gql`
  mutation deleteTown($input: townDeleteRequestInput!) {
    townDeleteRequest(input: $input) {
      isOK
      message
    }
  }
`;

const updateTownMutation = gql`
  mutation updateTown($input: townUpdateRequestInput!) {
    townUpdateRequest(input: $input) {
      isOK
      message
    }
  }
`;

const addFriendMutation = gql`
  mutation addFriend($input: addFriendInput!) {
    addFriend(input: $input)
  }
`;

const updateUserMutation = gql`
  mutation updateUser($input: updateUserInput) {
    updateUser(input: $input) {
      id
      player
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
    }
  }
`;

const deleteUserMutation = gql`
  mutation deleteUser($input: deleteUserInput) {
    deleteUser(input: $input)
  }
`;

const acceptFriendMutation = gql`
  mutation acceptFriend($input: addFriendInput!) {
    acceptFriend(input: $input)
  }
`;

const rejectFriendMutation = gql`
  mutation rejectFriend($input: addFriendInput!) {
    rejectFriend(input: $input)
  }
`;

export const addFriend = async (payload: AddFriendRequest): Promise<boolean> => {
  const { data } = await client.mutate({
    mutation: addFriendMutation,
    variables: { input: payload },
  });
  return data.addFriend;
};

export const acceptFriend = async (payload: AcceptFriendRequest): Promise<boolean> => {
  const { data } = await client.mutate({
    mutation: acceptFriendMutation,
    variables: { input: payload },
  });
  return data.acceptFriend;
};

export const updateUser = async (payload: UpdateUserRequest): Promise<User> => {
  const { data } = await client.mutate({
    mutation: updateUserMutation,
    variables: { input: payload },
  });
  return data.updateUser;
};
