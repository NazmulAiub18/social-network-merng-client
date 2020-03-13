import React, { useContext, useState, useRef } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  Grid,
  Image,
  Card,
  Button,
  Icon,
  Label,
  Form
} from "semantic-ui-react";
import moment from "moment";

import { AuthContext } from "../context/auth";
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";
import MyPopup from "../util/MyPopup";

const SinglePost = props => {
  const [comment, setComment] = useState("");
  const commentInputRef = useRef(null);

  const { user } = useContext(AuthContext);
  const postId = props.match.params.postId;

  const deletePostCallback = () => {
    props.history.push("/");
  };

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    variables: {
      postId,
      body: comment
    },
    update: () => {
      setComment("");
      commentInputRef.current.blur();
    }
  });

  const { loading, error, data } = useQuery(FETCH_POST_QUERY, {
    variables: { postId }
  });

  let postMarkUp;
  if (loading) {
    postMarkUp = <p>Loading Post...</p>;
  } else {
    if (error) {
      postMarkUp = (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      );
    } else {
      const {
        id,
        body,
        username,
        createdAt,
        comments,
        likes,
        likeCount,
        commentCount
      } = data.getPost;
      postMarkUp = (
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              <Image
                floated="right"
                size="small"
                src="https://react.semantic-ui.com/images/avatar/large/molly.png"
              />
            </Grid.Column>
            <Grid.Column width={10}>
              <Card fluid>
                <Card.Content>
                  <Card.Header>{username}</Card.Header>
                  <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                  <Card.Description>{body}</Card.Description>
                </Card.Content>
                <hr />
                <Card.Content extra>
                  <LikeButton user={user} post={{ likes, likeCount, id }} />
                  <MyPopup content="Comment On Post">
                    <Button as="div" labelPosition="right">
                      <Button basic color="blue">
                        <Icon name="comments" />
                      </Button>
                      <Label basic color="blue" pointing="left">
                        {commentCount}
                      </Label>
                    </Button>
                  </MyPopup>
                  {user && user.username === username && (
                    <DeleteButton postId={id} callback={deletePostCallback} />
                  )}
                </Card.Content>
              </Card>
              {user && (
                <Card fluid>
                  <Card.Content>
                    <p>Post a Comment</p>
                    <Form>
                      <div className="ui action input fluid">
                        <input
                          type="text"
                          placeholder="Comment ..."
                          name="comment"
                          value={comment}
                          onChange={event => setComment(event.target.value)}
                          ref={commentInputRef}
                        />
                        <button
                          type="submit"
                          className="ui button teal"
                          disabled={!comment.trim()}
                          onClick={createComment}
                        >
                          Submit
                        </button>
                      </div>
                    </Form>
                  </Card.Content>
                </Card>
              )}
              {comments.map(comment => (
                <Card fluid key={comment.id}>
                  <Card.Content>
                    {user && user.username === comment.username && (
                      <DeleteButton postId={postId} commentId={comment.id} />
                    )}
                    <Card.Header>{comment.username}</Card.Header>
                    <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                    <Card.Description>{comment.body}</Card.Description>
                  </Card.Content>
                </Card>
              ))}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      );
    }
  }
  return postMarkUp;
};

const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      username
      createdAt
      likeCount
      likes {
        id
        username
      }
      commentCount
      comments {
        id
        body
        username
        createdAt
      }
    }
  }
`;

const CREATE_COMMENT_MUTATION = gql`
  mutation createComment($postId: ID!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      comments {
        id
        username
        body
        createdAt
      }
      commentCount
    }
  }
`;

export default SinglePost;
