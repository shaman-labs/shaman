#!/bin/bash

# Load environment variables
source .env

function get_chain_id() {
    local network=$1
    case $network in
        "base-sepolia")
            echo "84532"
            ;;
        "arb-sepolia")
            echo "421614"
            ;;
        "base")
            echo "8453"
            ;;
        *)
            echo ""
            ;;
    esac
}

function get_world_address() {
    local chain_id=$1
    local worlds_file="worlds.json"
    
    if [ ! -f "$worlds_file" ]; then
        echo ""
        return
    fi
    
    # Use jq to extract the address for the given chain ID
    local address=$(jq -r ".[\"$chain_id\"].address" "$worlds_file")
    
    # Check if address is null or empty
    if [ "$address" = "null" ] || [ -z "$address" ]; then
        echo ""
    else
        echo "$address"
    fi
}

function deploy_network() {
    local network=$1
    local rpc_url=$2
    local world_address=$3
    local chain_id=$(get_chain_id $network)

    echo "Deploying to $network (Chain ID: $chain_id)..."

    # Build first
    pnpm run build

    if [ -z "$world_address" ]; then
        # Initial deployment
        FOUNDRY_ETH_RPC_URL=$rpc_url \
        mud deploy \
            --rpc $rpc_url \
            --rpcBatch=true
    else
        # Upgrade deployment
        FOUNDRY_ETH_RPC_URL=$rpc_url \
        mud deploy \
            --rpc $rpc_url \
            --worldAddress $world_address \
            --rpcBatch=true
    fi
}

function verify_contract() {
    local network=$1
    local rpc_url=$2
    local etherscan_key=$3
    local world_address=$4

    echo "Verifying on $network..."
    
    ETHERSCAN_API_KEY=$etherscan_key mud verify \
        --worldAddress $world_address \
        --rpc $rpc_url
}

# Parse command line arguments
COMMAND=$1
NETWORK=$2

case $NETWORK in
    "base-sepolia")
        RPC_URL=$BASE_SEPOLIA_RPC_URL
        ETHERSCAN_KEY=$BASE_ETHERSCAN_KEY
        ;;
    "arb-sepolia")
        RPC_URL=$ARB_SEPOLIA_RPC_URL
        ETHERSCAN_KEY=$ARB_ETHERSCAN_KEY
        ;;
    "base")
        RPC_URL=$BASE_RPC_URL
        ETHERSCAN_KEY=$BASE_ETHERSCAN_KEY
        ;;
    *)
        echo "Unknown network: $NETWORK"
        echo "Usage: ./deploy.sh [deploy|upgrade|verify] [base-sepolia|arb-sepolia]"
        exit 1
        ;;
esac

# Validate RPC URL
if [ -z "$RPC_URL" ]; then
    echo "Error: RPC URL not set for $NETWORK"
    exit 1
fi

# Get chain ID for the network
CHAIN_ID=$(get_chain_id $NETWORK)
if [ -z "$CHAIN_ID" ]; then
    echo "Error: Chain ID not found for network $NETWORK"
    exit 1
fi

case $COMMAND in
    "deploy")
        deploy_network "$NETWORK" "$RPC_URL"
        ;;
    "upgrade")
        WORLD_ADDRESS=$(get_world_address $CHAIN_ID)
        if [ -z "$WORLD_ADDRESS" ]; then
            echo "Error: No world address found for chain ID $CHAIN_ID in worlds.json"
            exit 1
        fi
        deploy_network "$NETWORK" "$RPC_URL" "$WORLD_ADDRESS"
        ;;
    "verify")
        WORLD_ADDRESS=$(get_world_address $CHAIN_ID)
        if [ -z "$WORLD_ADDRESS" ]; then
            echo "Error: No world address found for chain ID $CHAIN_ID in worlds.json"
            exit 1
        fi
        verify_contract "$NETWORK" "$RPC_URL" "$ETHERSCAN_KEY" "$WORLD_ADDRESS"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo "Usage: ./deploy.sh [deploy|upgrade|verify] [base-sepolia|arb-sepolia]"
        exit 1
        ;;
esac 