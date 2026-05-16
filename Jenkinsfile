pipeline {
    agent {
        label 'dev'
    }

    environment {
        // Replace this with your GitHub repository URL.
        GIT_REPO_URL = 'https://github.com/tanmayanand840/chat-app.git'

        // Set this to your Docker Hub username.
        DOCKERHUB_USERNAME = 'tanmayanand24'

        CLIENT_IMAGE = "${DOCKERHUB_USERNAME}/chat-client"
        SERVER_IMAGE = "${DOCKERHUB_USERNAME}/chat-server"
        IMAGE_TAG = 'latest'

        // Replace these values with your EC2 deployment user and host.
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '3.110.172.41'
        DEPLOY_TARGET = "${DEPLOY_USER}@${DEPLOY_HOST}"

        CLIENT_CONTAINER = 'chat-client'
        SERVER_CONTAINER = 'chat-server'
        MONGO_CONTAINER = 'mongodb'
        DOCKER_NETWORK = 'chat-app-network'
        MONGO_IMAGE = 'mongo:7'
        MONGO_VOLUME = 'chat-app-mongodb-data'

        CLIENT_PORT = '5173'
        SERVER_PORT = '5000'

        // Create this file on EC2 with backend secrets such as JWT, MongoDB, and Cloudinary values.
        SERVER_ENV_FILE = '/opt/chat-app/server.env'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clean workspace first so every build starts from a fresh checkout.
                cleanWs()

                // Clone the MERN chat application source code from GitHub.
                git branch: 'main', url: "${GIT_REPO_URL}"
            }
        }

        stage('Build Client Image') {
            steps {
                // Build the React + Vite frontend Docker image.
                sh '''
                    set -e
                    docker build \
                      -t "$CLIENT_IMAGE:$IMAGE_TAG" \
                      ./client
                '''
            }
        }

        stage('Build Server Image') {
            steps {
                // Build the Node.js + Express backend Docker image.
                sh '''
                    set -e
                    docker build \
                      -t "$SERVER_IMAGE:$IMAGE_TAG" \
                      ./server
                '''
            }
        }

        stage('Docker Login') {
            steps {
                // Login securely using Jenkins credentials with ID: dockerhub.
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -e
                        echo "$DOCKERHUB_TOKEN" | docker login \
                          -u "$DOCKERHUB_USER" \
                          --password-stdin
                    '''
                }
            }
        }

        stage('Push Client Image') {
            steps {
                // Push the frontend image to Docker Hub.
                sh '''
                    set -e
                    docker push "$CLIENT_IMAGE:$IMAGE_TAG"
                '''
            }
        }

        stage('Push Server Image') {
            steps {
                // Push the backend image to Docker Hub.
                sh '''
                    set -e
                    docker push "$SERVER_IMAGE:$IMAGE_TAG"
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                // SSH into the EC2 deployment server and replace old containers with the latest images.
                sshagent(credentials: ['agent-ssh']) {
                    sh '''
                        set -e

                        ssh -o StrictHostKeyChecking=no "$DEPLOY_TARGET" "
                            set -e

                            echo 'Creating Docker network if it does not exist...'
                            docker network create $DOCKER_NETWORK || true

                            echo 'Checking backend environment file...'
                            test -f $SERVER_ENV_FILE

                            echo 'Pulling latest Docker images...'
                            docker pull $CLIENT_IMAGE:$IMAGE_TAG
                            docker pull $SERVER_IMAGE:$IMAGE_TAG
                            docker pull $MONGO_IMAGE

                            echo 'Creating MongoDB volume if it does not exist...'
                            docker volume create $MONGO_VOLUME

                            echo 'Starting MongoDB container if needed...'
                            if docker ps -a --format '{{.Names}}' | grep -Eq '^$MONGO_CONTAINER$'; then
                              docker start $MONGO_CONTAINER || true
                              docker network connect $DOCKER_NETWORK $MONGO_CONTAINER || true
                            else
                              docker run -d \\
                                --name $MONGO_CONTAINER \\
                                --restart unless-stopped \\
                                --network $DOCKER_NETWORK \\
                                --network-alias mongodb \\
                                -v $MONGO_VOLUME:/data/db \\
                                $MONGO_IMAGE
                            fi

                            echo 'Waiting for MongoDB to become ready...'
                            for i in 1 2 3 4 5 6 7 8 9 10; do
                              if docker exec $MONGO_CONTAINER mongosh --quiet --eval 'db.adminCommand(\"ping\").ok' | grep -q 1; then
                                echo 'MongoDB is ready.'
                                break
                              fi

                              if [ \"\$i\" = '10' ]; then
                                echo 'MongoDB did not become ready in time.'
                                docker logs $MONGO_CONTAINER --tail 50
                                exit 1
                              fi

                              sleep 3
                            done

                            echo 'Stopping old containers if they are running...'
                            docker stop $CLIENT_CONTAINER || true
                            docker stop $SERVER_CONTAINER || true

                            echo 'Removing old containers if they exist...'
                            docker rm $CLIENT_CONTAINER || true
                            docker rm $SERVER_CONTAINER || true

                            echo 'Starting backend container...'
                            docker run -d \\
                              --name $SERVER_CONTAINER \\
                              --restart unless-stopped \\
                              --network $DOCKER_NETWORK \\
                              --network-alias backend \\
                              --env-file $SERVER_ENV_FILE \\
                              -e NODE_ENV=production \\
                              -e PORT=$SERVER_PORT \\
                              -e MONGODB_URI=mongodb://mongodb:27017/chat-app \\
                              -e CLIENT_URL=http://$DEPLOY_HOST:$CLIENT_PORT \\
                              -p $SERVER_PORT:$SERVER_PORT \\
                              $SERVER_IMAGE:$IMAGE_TAG

                            echo 'Starting frontend container...'
                            docker run -d \\
                              --name $CLIENT_CONTAINER \\
                              --restart unless-stopped \\
                              --network $DOCKER_NETWORK \\
                              -p $CLIENT_PORT:$CLIENT_PORT \\
                              $CLIENT_IMAGE:$IMAGE_TAG

                            echo 'Deployment completed successfully.'
                            docker ps \\
                              --filter name=$MONGO_CONTAINER \\
                              --filter name=$SERVER_CONTAINER \\
                              --filter name=$CLIENT_CONTAINER
                        "
                    '''
                }
            }
        }

        stage('Cleanup Docker') {
            steps {
                // Remove unused Docker images, containers, networks, and build cache from the Jenkins agent.
                sh '''
                    docker system prune -af || true
                '''
            }
        }
    }

    post {
        always {
            // Logout after the pipeline finishes so credentials are not kept active.
            sh '''
                docker logout || true
            '''
        }

        success {
            echo 'CI/CD pipeline completed successfully. Images were built, pushed, and deployed.'
        }

        failure {
            echo 'CI/CD pipeline failed. Check the stage logs above for the exact error.'
        }
    }
}
