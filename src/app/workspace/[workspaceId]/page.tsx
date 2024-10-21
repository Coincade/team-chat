interface WorkspaceIdProps{
    params:{
        workspaceId: string
    }
}

const WorkspaceIdPage = ({params}: WorkspaceIdProps) => {
  return (
    <div>
        ID:{params.workspaceId}
    </div>
  )
}

export default WorkspaceIdPage